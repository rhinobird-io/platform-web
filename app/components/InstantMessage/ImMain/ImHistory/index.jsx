const React = require("react");
const RouteHandler = require("react-router").RouteHandler;
const ImMessage = require('./ImMessage');

import MessageAction from '../../../../actions/MessageAction.js';
import MessageStore from '../../../../stores/MessageStore.js';
import ChannelStore from '../../../../stores/ChannelStore.js';
import LoginStore from '../../../../stores/LoginStore.js';
import PerfectScroll from '../../../PerfectScroll';
import Flex from '../../../Flex';


require('./style.less');
module.exports = React.createClass({

    contextTypes: {
        router: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return {
            messages: []
        }
    },

    componentDidMount() {
        MessageStore.addChangeListener(this._onMessageChange);
        ChannelStore.addChangeListener(this._onChannelChange);
    },

    componentWillUnmount() {
        MessageStore.removeChangeListener(this._onMessageChange);
        ChannelStore.removeChangeListener(this._onChannelChange);
    },
    componentWillUpdate: function() {
        var node = this.getDOMNode();
        this.shouldScrollBottom = node.scrollTop + node.clientHeight > node.scrollHeight - 1;
    },
    componentDidUpdate: function() {
        if (this.shouldScrollBottom) {
            var node = this.getDOMNode();
            node.scrollTop = node.scrollHeight - node.clientHeight;
        }
    },
    _onMessageChange() {
        let messages = MessageStore.getMessages(this.state.currentChannel);
        this.setState({
            messages: messages
        });
    },

    _onChannelChange() {
        let currentChannel = ChannelStore.getCurrentChannel();
        this.setState({
            currentChannel: currentChannel,
            messages: []
        });
        MessageAction.getMessages(currentChannel);
        // MessageAction.confirmMessageSeen(LoginStore.getUser(), currentChannel);
    },

    render() {
        return (
            <Flex.Layout vertical perfectScroll className="history">
                <div style={{flex: 1}}></div>
                {
                    this.state.messages.map((msg, idx) => <ImMessage key={msg.id} Message={msg}></ImMessage>).reverse()
                }
            </Flex.Layout>
        );
    }
});