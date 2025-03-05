import {Component} from 'react'
import Loader from 'react-loader-spinner'
import LatestMatch from '../LatestMatch'
import MatchCard from '../MatchCard'
import './index.css'

const teamMatchesApiUrl = 'https://apis.ccbp.in/ipl/'

class TeamMatches extends Component {
  state = {
    isLoading: true,
    teamMatchesData: {},
    error: null,
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

      console.log(formattedData, 'matchesData')

      this.setState({teamMatchesData: formattedData, isLoading: false})
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

  renderTeamMatches = () => {
    const {teamMatchesData, error} = this.state
    const {teamBannerURL, latestMatch} = teamMatchesData

    if (error) {
      return <p className="error-message">{error}</p>
    }

    return (
      <div className="responsive-container">
        {teamBannerURL && (
          <img src={teamBannerURL} alt="team banner" className="team-banner" />
        )}
        {latestMatch && <LatestMatch latestMatchData={latestMatch} />}
        {this.renderRecentMatchesList()}
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

export default TeamMatches
