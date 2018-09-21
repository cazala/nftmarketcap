import { getContract } from './OpenSea'

const gap = 4000
const aWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
const yesterday = Date.now() - 24 * 60 * 60 * 1000

const fill = data => {
  const lastDate = data.length > 1 ? data.slice(-1)[0][0] : aWeekAgo
  for (let i = lastDate; i < yesterday - gap; i += 4000000) {
    data.push([i, 0])
  }
  return data
}

const avg7d = data => {
  const entries = data.filter(entry => entry[0] > aWeekAgo - gap)
  if (entries.length == 0) return 0
  const sum = entries.reduce((total, entry) => total + entry[1], 0)
  return sum / entries.length
}

const sum7d = data => {
  const entries = data.filter(entry => entry[0] > aWeekAgo - gap)
  if (entries.length == 0) return 0
  const sum = entries.reduce((total, entry) => total + entry[1], 0)
  return sum
}

export default class NFT {
  _inited = false
  _promise = null

  constructor({ name, url }) {
    this.name = name
    this.url = url
    this.contract = null
  }

  async _init() {
    if (this._inited) {
      return
    }
    this.contract = await getContract(this.name)

    const page = await fetch(
      `https://cors-anywhere.herokuapp.com/${this.url}`
    ).then(r => r.text())
    const series = page
      .split('Highcharts.stockChart(')[1]
      .split(/series:\s*\[/)[1]
    const getData = name => {
      try {
        return JSON.parse(
          series
            .split(name)[1]
            .split(/data:\s*/)[1]
            .split(':')[0]
            .split(',')
            .slice(0, -1)
            .join(',')
        )
      } catch (error) {
        return []
      }
    }
    this.totalUSD = getData('Total USD')
    this.avgUSD = getData('Average USD')
    this.totalQuantity = getData('Total Quantity')
    this._inited = true
  }

  async _prepare() {
    if (!this._promise) {
      this._promise = this._init()
    }
    return this._promise
  }

  async getName() {
    await this._prepare()
    return this.contract.name
  }

  async getSymbol() {
    await this._prepare()
    return this.contract.symbol
  }

  async getTotalSupply() {
    await this._prepare()
    return this.contract.stats.count
  }

  async getAvgPrice() {
    await this._prepare()
    const avg = avg7d(fill(this.avgUSD))
    return avg
  }

  async getVolume() {
    await this._prepare()
    return sum7d(fill(this.totalUSD))
  }

  async getImage() {
    await this._prepare()
    return this.contract.image_url
  }

  async getLink() {
    await this._prepare()
    return this.contract.external_link
  }

  async getGraph() {
    await this._prepare()
    return fill(this.avgUSD)
      .map(item => ({ timestamp: item[0], avg: item[1] }))
      .filter(item => item.timestamp > aWeekAgo)
  }
}
