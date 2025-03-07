import {Component} from 'react'
import {withRouter} from 'react-router-dom'
import Loader from 'react-loader-spinner'
import {PieChart, Pie, Cell, Tooltip, Legend} from 'recharts'
import LatestMatch from '../LatestMatch'
import MatchCard from '../MatchCard'
import './index.css'

const teamMatchesApiUrl = 'https://apis.ccbp.in/ipl/'

class TeamMatches extends Component {
  state = {
    isLoading: true,
    teamMatchesData: {},
    error: null,
    statistics: {
      win: 0,
      loss: 0,
      draw: 0,
    },
  }

  componentDidMount() {
    this.getTeamMatches()
  }

  getFormattedData = data => ({
    umpires: data.umpires,
    result: data.result,
    manOfTheMatch: data.man_of_the_match,
    id: data.id,
    date: data.date,
    venue: data.venue,
    competingTeam: data.competing_team,
    competingTeamLogo: data.competing_team_logo,
    firstInnings: data.first_innings,
    secondInnings: data.second_innings,
    matchStatus: data.match_status,
  })

  getTeamMatches = async () => {
    const {params} = this.props.match
    const {id} = params

    try {
      const response = await fetch(`${teamMatchesApiUrl}${id}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const fetchedData = await response.json()
      if (!fetchedData || !fetchedData.team_banner_url) {
        throw new Error('Invalid API response')
      }

      const formattedData = {
        teamBannerURL: fetchedData.team_banner_url,
        latestMatch: this.getFormattedData(fetchedData.latest_match_details),
        recentMatches:
          fetchedData.recent_matches?.map(this.getFormattedData) || [],
      }

      // ✅ Calculate statistics before updating state
      const updatedStats = {win: 0, loss: 0, draw: 0}
      formattedData.recentMatches.forEach(match => {
        if (match.matchStatus.toLowerCase() === 'won') updatedStats.win += 1
        else if (match.matchStatus.toLowerCase() === 'lost')
          updatedStats.loss += 1
        else updatedStats.draw += 1 // Assuming any other result is a draw
      })

      this.setState({
        teamMatchesData: formattedData,
        statistics: updatedStats,
        isLoading: false,
      })
      console.log(formattedData, 'formatted Data')
    } catch (error) {
      console.error('Error fetching team matches:', error)
      this.setState({isLoading: false, error: 'Failed to load team matches'})
    }
  }

  renderRecentMatchesList = () => {
    const {teamMatchesData} = this.state
    const {recentMatches = []} = teamMatchesData

    return (
      <ul className="recent-matches-list">
        {recentMatches.map(recentMatch => (
          <MatchCard matchDetails={recentMatch} key={recentMatch.id} />
        ))}
      </ul>
    )
  }

  handleBack = () => {
    const {history} = this.props
    history.replace('/')
  }

  // ✅ Render PieChart for statistics
  renderStatisticsPieChart = () => {
    const {statistics} = this.state

    const data = [
      {name: 'Wins', value: statistics.win, color: '#4CAF50'},
      {name: 'Losses', value: statistics.loss, color: '#F44336'},
      {name: 'Draws', value: statistics.draw, color: '#FFEB3B'},
    ]

    return (
      <div className="pie-chart-container">
        <h3>Match Statistics</h3>
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    )
  }

  renderTeamMatches = () => {
    const {teamMatchesData, error} = this.state
    const {teamBannerURL, latestMatch} = teamMatchesData

    if (error) {
      return <p className="error-message">{error}</p>
    }

    return (
      <div className="responsive-container">
        <button onClick={this.handleBack}>Back</button>
        {teamBannerURL && (
          <img src={teamBannerURL} alt="team banner" className="team-banner" />
        )}
        {latestMatch && <LatestMatch latestMatchData={latestMatch} />}
        {this.renderRecentMatchesList()}
        {this.renderStatisticsPieChart()} {/* ✅ PieChart added here */}
      </div>
    )
  }

  renderLoader = () => (
    <div data-testid="loader" className="loader-container">
      <Loader type="Oval" color="#ffffff" height={50} width={50} />
    </div>
  )

  getRouteClassName = () => {
    const {params} = this.props.match
    const {id} = params

    const teamClassMap = {
      RCB: 'rcb',
      KKR: 'kkr',
      KXP: 'kxp',
      CSK: 'csk',
      RR: 'rr',
      MI: 'mi',
      SH: 'srh',
      DC: 'dc',
    }

    return teamClassMap[id] || ''
  }

  render() {
    const {isLoading} = this.state
    const className = `team-matches-container ${this.getRouteClassName()}`

    return (
      <div className={className}>
        {isLoading ? this.renderLoader() : this.renderTeamMatches()}
      </div>
    )
  }
}

export default withRouter(TeamMatches)
