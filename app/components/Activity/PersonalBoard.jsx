const React = require("react");
const mui = require("material-ui"), ListItem = mui.ListItem;
const Flex = require("../Flex");
const Common = require('../Common');
const UserStore = require('../../stores/UserStore');
const LoginStore = require('../../stores/LoginStore');
const ActivityStore = require('../../stores/ActivityStore');
const ActivityUserStore = require('../../stores/ActivityUserStore');
const Member = require('../Member');
const ActivityItem = require('./ActivityItem');
const Link = require('react-router').Link;
const ActivityConstants = require('../../constants/ActivityConstants');
const ActivityAction = require('../../actions/ActivityAction');

module.exports = React.createClass({
    componentDidMount(){
        ActivityStore.addChangeListener(this._activityChange);
        this.setState({
            user: ActivityUserStore.getCurrentUser()
        });
    },
    componentWillUnmount() {
        ActivityStore.removeChangeListener(this._activityChange);
    },
    _activityChange(){
        this.setState({
            next: ActivityStore.nextSpeech()
        })
    },
    getInitialState() {
        return {
            next: null
        }
    },
    contextTypes: {
        muiTheme: React.PropTypes.object
    },
    render(){
        if(!this.state.user){
            return null;
        }
        return <mui.Paper style={{padding:12, width:'100%'}}>
            <Flex.Layout start justified style={{marginLeft:12}}>
                <div>
                    <Common.Display type='display1' style={{color:this.context.muiTheme.palette.primary1Color}} title="Available/Total">{this.state.user.point_available}/{this.state.user.point_total}</Common.Display>
                    <Common.Display type='display1' style={{marginLeft:24}}>Points</Common.Display>
                </div>
                {this.state.user.role === ActivityConstants.USER_ROLE.ADMIN ?
                    <Link to='administration'><mui.RaisedButton secondary={true} label="Administration"/></Link> :
                    <Link to='personal-home' params={{"userid": LoginStore.getUser().id}}><mui.RaisedButton secondary={true} label="My activities"/></Link>}


            </Flex.Layout>
            {this.state.next? <div>
            <Common.Hr style={{margin: '12px 12px'}}/>
            <Common.Display type='body3' style={{marginLeft:12}}>Next coming</Common.Display>
                <ActivityItem activity={this.state.next}/>
            </div>: undefined}
        </mui.Paper>;
    }
});