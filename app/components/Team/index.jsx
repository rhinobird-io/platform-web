'use strict';

const React      = require('react'),
    mui        = require('material-ui'),
    Paper      = mui.Paper;

const UserStore = require('../../stores/UserStore');
const LoginStore = require('../../stores/LoginStore');
const Flex = require('../Flex');
const Member = require('../Member')

require("./style.less");

let TeamDisplay = React.createClass({
    render: function(){
        if(this.props.team){
            return <div className='paper-outer-container'>
                <Paper zDepth={1}>
                    <div className='paper-inner-container'>
                        <Flex.Layout center className='mui-font-style-title'>
                            <mui.FontIcon className='icon-group'/>
                            <div styles={{marginLeft: 8}}>{this.props.team.name}</div>
                        </Flex.Layout>
                        {this.props.team.users.map((user)=>{
                            return <div styles={{margin: '12px 0'}}>
                                <Member.Avatar member={user} />
                                <Member.Name styles={{marginLeft: 8}} member={user}/>
                            </div>;
                        })}
                    </div>
                </Paper>
                </div>
        } else {
            return null;
        }
    }
});

module.exports = React.createClass({
    componentDidMount(){
        this.props.setTitle('Team');
        UserStore.addChangeListener(this._userChanged);
    },
    componentWillUnmount(){
        UserStore.removeChangeListener(this._userChanged);

    },
    _userChanged(){
        this.forceUpdate();
    },
    render: function() {
        let loginUser = LoginStore.getUser();
        let teams = UserStore.getTeamsByUserId(loginUser.id);
        return <Flex.Layout centerJustified wrap className='teamPage'>
            {teams.map((t)=>{return <TeamDisplay team={t}/>})}
        </Flex.Layout>;
    }
});
