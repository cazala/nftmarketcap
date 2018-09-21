import 'semantic-ui-css/semantic.min.css'
import './index.css'
import { Container, Header, Table, Tab, Loader } from 'semantic-ui-react'
import { LineChart, Line } from 'recharts'
import NFT from '../src/NFT'

var Decentraland = new NFT({
  name: 'decentraland',
  url: 'https://nonfungible.com/pages/decentraland/market/history'
})

var CryptoKitties = new NFT({
  name: 'cryptokitties',
  url: 'https://nonfungible.com/pages/cryptokitties/market/history'
})

var AxieInfinity = new NFT({
  name: 'axie',
  url: 'https://nonfungible.com/pages/axieinfinity/market/history'
})

var EthTown = new NFT({
  name: 'eth town',
  url: 'https://nonfungible.com/pages/ethtown/market/history'
})

var CryptoPunks = new NFT({
  name: 'punks',
  url: 'https://nonfungible.com/pages/cryptopunks/market/history'
})

var Etheremon = new NFT({
  name: 'etheremon',
  url: 'https://nonfungible.com/pages/etheremon/market/history'
})

var KnownOrigin = new NFT({
  name: 'known',
  url: 'https://nonfungible.com/pages/knownorigin/market/history'
})

var tokens = [
  Decentraland,
  CryptoKitties,
  AxieInfinity,
  EthTown,
  CryptoPunks,
  Etheremon,
  KnownOrigin
]

const getMarketCap = token => token.avgPrice * token.totalSupply

const sortByMarketCap = (a, b) => (getMarketCap(a) > getMarketCap(b) ? -1 : 1)

export default class extends React.Component {
  constructor(props) {
    super(props)
    let data = []
    if (global.localStorage) {
      try {
        data = JSON.parse(global.localStorage.getItem('data')) || []
      } catch (e) {}
    }
    this.state = {
      loaded: data.length > 0,
      tokens: data.sort(sortByMarketCap)
    }
  }

  componentDidMount() {
    this.fetchData()
    this.interval = setInterval(() => this.fetchData(), 5 * 60 * 1000)
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  async fetchData() {
    const data = await Promise.all(
      tokens.map(async token => ({
        name: await token.getName(),
        symbol: await token.getSymbol(),
        avgPrice: await token.getAvgPrice(),
        totalSupply: await token.getTotalSupply(),
        volume: await token.getVolume(),
        link: await token.getLink(),
        image: await token.getImage(),
        graph: await token.getGraph()
      }))
    )
    if (global.localStorage) {
      global.localStorage.setItem('data', JSON.stringify(data))
    }
    this.setState({ tokens: data.sort(sortByMarketCap), loaded: true })
  }

  renderTable = () => {
    if (!this.state.loaded) {
      return <Loader size="huge" active />
    }
    return (
      <Table basic="very" celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>#</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Avg. Market Cap (7d)</Table.HeaderCell>
            <Table.HeaderCell>Avg. Price (7d)</Table.HeaderCell>
            <Table.HeaderCell>Volume (7d)</Table.HeaderCell>
            <Table.HeaderCell>Total Supply</Table.HeaderCell>
            <Table.HeaderCell>Price Graph (7d)</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.state.tokens.map((token, index) => (
            <Table.Row
              key={index}
              className={getMarketCap(token) === 0 ? 'off' : ''}
            >
              <Table.Cell>{index + 1}</Table.Cell>
              <Table.Cell>
                <div className="wrapper">
                  <img className="token-image" src={token.image} />
                  <a href={token.link}>{token.name}</a>
                </div>
              </Table.Cell>
              <Table.Cell>
                ${Number(getMarketCap(token).toFixed(0)).toLocaleString()}
              </Table.Cell>
              <Table.Cell>${token.avgPrice.toLocaleString()}</Table.Cell>
              <Table.Cell>
                ${Number(token.volume.toFixed(0)).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                {token.totalSupply.toLocaleString()} {token.symbol}
              </Table.Cell>
              <Table.Cell>
                <LineChart
                  width={200}
                  height={50}
                  data={token.graph}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <Line type="monotone" dataKey="avg" stroke="#ecc447" />
                </LineChart>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  render() {
    return (
      <Container>
        <br />
        <Header size="large" align="center">
          Top Non-Fungible Tokens By Market Capitalization
        </Header>
        <br />
        <Tab
          panes={[
            {
              menuItem: 'NTFs',
              render: this.renderTable
            }
          ]}
        />
        {this.state.loaded ? (
          <>
            <p className="info">
              * all the data comes from{' '}
              <a href="https://nonfungible.com">nonfungible.com</a> and{' '}
              <a href="https://opensea.io">opensea.io</a>
            </p>
          </>
        ) : null}
      </Container>
    )
  }
}
