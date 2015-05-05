'use strict';

const React = require("react");
const RouteHandler = require("react-router").RouteHandler;
const mui = require("material-ui");

import MessageAction from '../../../../../actions/MessageAction';
import ChannelAction from '../../../../../actions/ChannelAction';
import LoginStore from '../../../../../stores/LoginStore';
import ChannelStore from '../../../../../stores/ChannelStore';
import OnlineStore from '../../../../../stores/OnlineStore';
import MessageStore from '../../../../../stores/MessageStore';
import UnreadStore from '../../../../../stores/MessageUnreadStore';

const { Menu, FontIcon, FlatButton } = mui;

require('./style.less');
module.exports = React.createClass({
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return {
            _currentChannel : {},
            _onlineStatus : {},
            _imCurrentChannel : false,
            _hasUnread : false
        }
    },

    componentDidMount() {
        ChannelStore.addChangeListener(this._onChannelChange);
        OnlineStore.addChangeListener(this._onlineListChange);
        UnreadStore.addChangeListener(this._onUnreadChange);
    },

    componentWillUnmount() {
        ChannelStore.removeChangeListener(this._onChannelChange);
        OnlineStore.removeChangeListener(this._onlineListChange);
        UnreadStore.removeChangeListener(this._onUnreadChange);
    },

    _onChannelChange() {
        let currentChannel = ChannelStore.getCurrentChannel();
        let imCurrentChannel = currentChannel.backEndChannelId === this.props.Channel.backEndChannelId;
        this.setState({
            _currentChannel : currentChannel,
            _imCurrentChannel : imCurrentChannel
        });
    },

    _onlineListChange() {
        this.setState({
            _onlineStatus : OnlineStore.getOnlineList()
        });
    },

    _onUnreadChange() {
        let hasUnread = UnreadStore.hasUnread(this.props.Channel.backEndChannelId);
        this.setState({
            _hasUnread : hasUnread
        });

    },

    _onItemTap(item, e) {
        let currentChannel = ChannelStore.getCurrentChannel();
        if (currentChannel.backEndChannelId !== item.backEndChannelId) {
            ChannelAction.changeChannel(item.backEndChannelId, LoginStore.getUser());
            this.context.router.transitionTo('/platform/im/talk/' + item.backEndChannelId);
        }
    },

    render() {
        let self = this;
        return (
            <div className="instant-message-channel-container">
                <FlatButton className={this.state._imCurrentChannel?'instant-message-channel-item-selected instant-message-channel-item ':'instant-message-channel-item '}  onClick={self._onItemTap.bind(self, this.props.Channel)}>
                    <span className={ this.props.Channel.iconClassName}></span>
                    <span className={(this.props.Channel.isDirect && !self.state._onlineStatus[ this.props.Channel.channel.id])?'instant-message-channel-item-offline':''}>{ this.props.Channel.text}</span>
                </FlatButton>
                <span className={ this.state._hasUnread?'instant-message-channel-item-unread icon-message':''}></span>
            </div>
        );
    }
});