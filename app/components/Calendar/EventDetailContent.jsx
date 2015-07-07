const React = require('react');
const Flex = require('../Flex');
const Moment = require('moment');
const Popup = require('../Popup');
const MUI = require('material-ui');
const Member = require('../Member');
const Thread = require('../Thread');
const Display = require('../Common').Display;
const UserStore = require('../../stores/UserStore');
const LoginStore = require('../../stores/LoginStore');
const SmartDisplay = require('../SmartEditor').SmartDisplay;
const StylePropable = require('material-ui/lib/mixins/style-propable');

let EventDetailContent = React.createClass({
    mixins: [StylePropable],
    propTypes: {
        event: React.PropTypes.object
    },

    contextTypes: {
        muiTheme: React.PropTypes.object
    },

    getDefaultProps() {
        return {
            event: {}
        }
    },

    getInitialState() {
        return {
            event: this.props.event
        }
    },

    render() {
        let styles = {
            eventTitle: {
                position: "relative",
                overflow: "hidden",
                fontSize: "2em",
                lineHeight: "2em",
                wordBreak: "break-all",
                padding: "0 0.8em",
                color: this.context.muiTheme.palette.canvasColor,
                backgroundColor: this.context.muiTheme.palette.primary1Color
            },
            eventAction: {
                height: 120,
                padding: 6,
                backgroundColor: this.context.muiTheme.palette.primary1Color
            },
            eventInfo: {
                fontSize: "1em"
            },
            eventSchedule: {
            },
            eventDetailItem: {
                fontSize: "1em",
                padding: "1em 0"
            },
            eventDetailIcon: {
                minWidth: 24,
                marginRight: 24
            },
            repeatSymbol: {
                width: "64px",
                height: "64px",
                color: "white",
                right: "-32px",
                bottom: "-32px",
                position: "absolute",
                borderRadius: "50%",
                textAlign: "left",
                backgroundColor: this.context.muiTheme.palette.accent1Color
            },
            repeatSymbolInner: {
                width: "50%",
                height: "50%",
                marginLeft: "3px",
                fontSize: "14px",
                verticalAlign: "baseline",
                lineHeight: "34px",
                textAlign: "center"
            },
            deleteButton: {
                color: this.context.muiTheme.palette.canvasColor
            }
        };

        let eventTitle = null;
        let eventActions = null;
        let eventContent = null;
        let eventComment = null;
        let event = this.state.event;

        if (this.state.notFound || event === null || event === undefined) {
            eventContent = <h3 style={{textAlign: "center", padding: 24, fontSize: "1.5em"}}>Event not found</h3>
        } else {
            let deleteEvent = LoginStore.getUser().id === event.creator_id ?
                <MUI.IconButton
                    iconStyle={styles.deleteButton}
                    iconClassName="icon-delete"
                    onClick={this._onEventDelete} /> : null;

            eventActions = <Flex.Layout horizontal endJustified style={styles.eventAction}>
                {deleteEvent}

            </Flex.Layout>;

            eventTitle = (
                <Flex.Layout vertical selfEnd key="title" style={styles.eventTitle}>
                    <span>{event.title}</span>
                    {
                        event && event.repeated ?
                            <div style={styles.repeatSymbol}>
                                <div style={styles.repeatSymbolInner}>{event.repeated_number}</div>
                            </div> :
                            null
                    }
                </Flex.Layout>
            );

            eventContent = [];

            let format;
            if (event.full_day) {
                format = "YYYY-MM-DD";
            } else {
                format = "YYYY-MM-DD HH:mm";
            }

            let formattedFrom = Moment(event.from_time).format(format);
            let formattedTo = Moment(event.to_time).format(format);

            let formatTime = formattedFrom;
            if (event.period && formattedFrom !== formattedTo) {
                formatTime += " ~ " + Moment(event.to_time).format(format)
            }

            // Event Schedule
            eventContent.push(
                <Flex.Layout horizontal key="schedule" style={this.mergeStyles(styles.eventDetailItem, styles.eventSchedule)}>
                    <Flex.Layout center style={styles.eventDetailIcon}><MUI.FontIcon className="icon-schedule"/></Flex.Layout>
                    <Flex.Layout center>{formatTime}</Flex.Layout>
                </Flex.Layout>
            );

            // Event Description
            eventContent.push(
                <Flex.Layout horizontal key="description" style={styles.eventDetailItem}>
                    <Flex.Layout center style={styles.eventDetailIcon}><MUI.FontIcon className="icon-details"/></Flex.Layout>
                    <Flex.Layout center>
                        <SmartDisplay
                            key="description"
                            disabled
                            multiLine
                            floatingLabelText="Description"
                            value={this.state.event.description} />
                    </Flex.Layout>
                </Flex.Layout>
            );

            // Event participants
            let participants = [];
            let teamParticipants = [];
            event.participants.forEach(p => {
                let u = UserStore.getUser(p.id);
                participants.push(
                    <Flex.Layout horizontal center key={"user_" + u.id} style={{marginBottom: 16, marginRight: 16}}>
                        <Member.Avatar scale={1.0} member={u} style={{borderRadius: "0%"}} />
                        <Member.Name style={{marginLeft: 6, width: 100, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}} member={u}></Member.Name>
                    </Flex.Layout>
                );
            });

            event.team_participants.forEach(p => {
                let t = UserStore.getTeam(p.id);
                teamParticipants.push(
                    <Flex.Layout horizontal center key={"team_" + t.id} style={{marginBottom: 16, marginRight: 16}}>
                        <Flex.Layout>
                            <MUI.FontIcon className="icon-group" style={{borderRadius: "0%"}} />
                        </Flex.Layout>
                        <span style={{marginLeft: 6, width: 100, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>{t.name}</span>
                    </Flex.Layout>
                );
            });

            // Event Participants
            eventContent.push(
                <Flex.Layout horizontal key="participants" style={styles.eventDetailItem}>
                    <Flex.Layout startJustified style={styles.eventDetailIcon}>
                        <MUI.FontIcon className="icon-person"/>
                    </Flex.Layout>
                    <Flex.Layout horizontal center wrap>
                        {participants}
                        {teamParticipants}
                    </Flex.Layout>
                </Flex.Layout>
            );
            //
            //eventComment = [];
            //eventComment.push(
            //    <Flex.Layout horizontal key="comments" style={styles.eventDetailItem}>
            //        <Flex.Layout startJustified style={styles.eventDetailIcon}>
            //            <MUI.FontIcon className="icon-comment"/>
            //        </Flex.Layout>
            //        <Flex.Layout vertical startJustified flex={1}>
            //            <Thread style={{width: "100%"}} threadKey={this.state.threadKey} threadTitle={`Event ${this.state.event.title}`}
            //                    participants={{users: this.state.event.participants, teams: this.state.event.team_participants}} />
            //        </Flex.Layout>
            //    </Flex.Layout>
            //);

        }
        return (
            <div style={{width: "100%", height:"100%"}}>
                {eventActions}
                {eventTitle}
                <div style={{padding: "0.6em 1.6em"}}>
                    {eventContent}
                    {eventComment}
                </div>
            </div>
        );
    }
});

module.exports = EventDetailContent;