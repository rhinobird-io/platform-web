const React = require('react');
const MUI = require('material-ui');
const Flex = require('../Flex');
const PopupSelect = require('../Select').PopupSelect;
const ClickAwayable = MUI.Mixins.ClickAwayable;
const SearchStore = require("../../stores/SearchStore");
const SearchAction = require("../../actions/SearchAction");

require('./style.less');

let SearchEverywhere = React.createClass({
    mixins: [ClickAwayable],

    getInitialState() {
        return {
            open: false,
            results: []
        };
    },

    componentClickAway() {
        this.close();
    },

    componentDidMount() {
        SearchStore.addChangeListener(this._onChange);
    },

    componentWillUnmount() {
        SearchStore.removeChangeListener(this._onChange);
    },

    open() {
        if (this.isOpen()) {
            return;
        }

        this.setState({
            open: true
        }, () => {
            this.refs.keyword.setValue('');
            this.refs.keyword.focus();
            this.refs.popup.show();
        });
    },

    close() {
        if (!this.isOpen()) {
            return;
        }
        this.refs.popup.dismiss();
        this.setState({
            open: false
        })
    },

    isOpen() {
        return this.state.open;
    },

    render() {
        let styles = {
            open: {
                top: "30%",
                width: 600,
                left: "50%",
                marginLeft: -300,
                borderRadius: 0,
                background: "rgba(0, 0, 0, .9)"
            },
            close: {
                height: 0,
                width: 0,
                left: 0,
                top: "100%",
                marginLeft: 0,
                background: "rgba(0, 0, 0, .9)"
            }
        };

        let results = this.state.results.map((result) => {
            return <div key={result._index + result._id} value={result._source._id}>
                {result._source.title}
            </div>;
        });

        let style = this.state.open ? styles.open : styles.close;

        return (
            <MUI.Paper ref="search" className="search-everywhere" style={style} zDepth={3}>
                <MUI.TextField
                    fullWidth
                    ref="keyword"
                    className="mui-text-search"
                    onFocus={() => this.refs.popup.show()}
                    onChange={() => SearchAction.search(this.refs.keyword.getValue())}
                    inputStyle={{padding: "0 0.4em", color: "white", fontSize: "1.2em"}}/>
                <PopupSelect
                    hRestrict
                    ref="popup"
                    onItemSelect={(value, e) => {
                        console.log(value);
                    }}
                    relatedTo={() => this.refs.search}>
                    {results}
                </PopupSelect>
            </MUI.Paper>
        );
    },

    _onChange() {
        this.setState({
            results: SearchStore.getSearchResults()
        })
    }
});

module.exports = SearchEverywhere;