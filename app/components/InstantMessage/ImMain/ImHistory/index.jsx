const React = require("react");
const RouteHandler = require("react-router").RouteHandler;
const ImMessage = require('./ImMessage');

import MessageAction from '../../../../actions/MessageAction.js';
import MessageStore from '../../../../stores/MessageStore.js';
import ChannelStore from '../../../../stores/ChannelStore.js';
import LoginStore from '../../../../stores/LoginStore.js';
import PerfectScroll from '../../../PerfectScroll';
import InfiniteScroll from '../../../InfiniteScroll';
import Flex from '../../../Flex';


require('./style.less');
module.exports = React.createClass({

    contextTypes: {
        router: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return {
            messages: [],
            upperThreshold: 100
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
        this.scrollHeight = node.scrollHeight;
        this.scrollTop = node.scrollTop;
    },
    componentDidUpdate: function() {
        var node = this.getDOMNode();
        if (this.shouldScrollBottom) {
            node.scrollTop = node.scrollHeight
        } else {
            node.scrollTop = this.scrollTop + (node.scrollHeight - this.scrollHeight);
        }
    },
    _onMessageChange() {
        let messages = MessageStore.getMessages(this.state.currentChannel);
        this.setState({
            messages: messages
        });
        let noMore = MessageStore.noMoreMessages(this.state.currentChannel);
        this.setState({
            upperThreshold: noMore? undefined: 100
        });
    },

    _onChannelChange() {
        let currentChannel = ChannelStore.getCurrentChannel();
        this.setState({
            currentChannel: currentChannel,
            messages: []
        });
    },

    render() {
        return (
            <Flex.Layout vertical perfectScroll className="history">
                <InfiniteScroll upperThreshold={this.state.upperThreshold} onUpperTrigger={()=>{
                    MessageAction.getMessages(ChannelStore.getCurrentChannel(), this.state.messages[this.state.messages.length-1]);
                }} scrollTarget={()=>{
                    return this.getDOMNode();
                }}/>
                <div style={{flex: 1}}>
                    {
                        this.state.messages.map((msg, idx) => <ImMessage key={idx} Message={msg}></ImMessage>).reverse()
                    }
                </div>

            </Flex.Layout>
        );
    }
});