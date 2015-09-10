const React = require("react");
const RouteHandler = require("react-router").RouteHandler;
const PerfectScroll = require("../../PerfectScroll");
const MUI = require('material-ui');
const Common = require('../../Common');
const Flex = require('../../Flex');
const Member = require('../../Member');
const UserStore = require('../../../stores/UserStore');
const SmartEditor = require('../../SmartEditor').SmartEditor;
const SmartDisplay = require('../../SmartEditor').SmartDisplay;
const FileUploader = require('../../FileUploader');
const Thread = require('../../Thread');
const ActivityAction = require('../../../actions/ActivityAction');
const ActivityStore = require('../../../stores/ActivityStore');
const ActivityUserStore = require('../../../stores/ActivityUserStore');
const LoginStore = require('../../../stores/LoginStore');
const ActivityConstants = require('../../../constants/ActivityConstants');
const StepBar = require('../../StepBar');
const Enum = require('enum');
const Moment = require("moment");
const Constants = require('../../FileUploader/constants');
const Link = require("react-router").Link;
const UserTable = require('./Table');

var speechStatus = new Enum({"New": 0, "Auditing": 1, "Approved": 2, "Confirmed": 3, "Finished": 4}, { ignoreCase: true });
module.exports = React.createClass({

    mixins: [React.addons.LinkedStateMixin],
    contextTypes: {
        muiTheme: React.PropTypes.object,
        router: React.PropTypes.func.isRequired
    },

    errorMsg: {
        descriptionRequired: "Speech description is required.",
        dateRequired: "Date is required.",
        timeRequired: "Time is required.",
        hoursRequired: "Hours is required.",
        minutesRequired: "Minutes is required."
    },

    componentDidMount() {
        ActivityStore.addChangeListener(this._onChange);
        if (!this.state.id) {
            let params = this.props.params;
            ActivityAction.receiveSpeech(params.id, {}, (e => this.setState({notFound: true})));
        }
    },

    componentWillUnmount() {
        ActivityStore.removeChangeListener(this._onChange);
    },

    getInitialState() {
        let params = this.props.params;
        return {
            speech: ActivityStore.getSpeech(params.id),
            notFound: false,
            threadKey: `/platform/activity/speeches/${params.id}`,
            showSelectTime: false,
            showRecordParticipants: false,
            audiences: {
                teams: [],
                users: []
            }
        };
    },

    render() {
        let styles = {
            bar: {
                fontSize: "2em",
                padding: "12px 12px 12px 0",
                minHeight: 60,
                maxHeight: 60,
                color: this.context.muiTheme.palette.canvasColor,
                backgroundColor: this.context.muiTheme.palette.primary1Color,
                whiteSpace:'nowrap'
            },
            title: {
                textOverflow:'ellipsis',
                overflow:'hidden',
                lineHeight: 12
            },
            inner: {
                maxWidth: 1000,
                height: '100%',
                padding: 0,
                margin: '0 auto'
            },
            detailItem: {
                fontSize: "1em",
                padding: "1em 0"
            },
            detailKey: {
                minWidth: 20,
                marginRight: 20
            },
            selectTime: {
                position: 'fixed',
                right: this.state.showSelectTime ? 0 : -300,
                top: 0,
                zIndex: 1000,
                transition: "all 500ms",
                opacity: 1,
                width: 300,
                height: "100%",
                padding: '20px 0px'
            },
            recordParticipants: {
                position: 'fixed',
                right: this.state.showRecordParticipants ? 0 : -600,
                top: 0,
                zIndex: 1000,
                transition: "all 500ms",
                opacity: 1,
                width: 600,
                height: "100%",
                padding: '20px 0px'
            }
        };

        let speech = this.state.speech;
        let bar = null;
        let speechAudiences = null;
        let speechDescription = null;
        let speechSpeaker = null;
        let speechCategory = null;
        let speechTime = null;
        let speechDuration = null;
        let speechFiles = null;
        let speechComment = null;
        let speechActions = null;
        let speechContent = null;
        let stepBar = null;

        if (this.state.notFound) {
            speechContent = <h3 style={{textAlign: "center", padding: 24, fontSize: "1.5em"}}>Speech not found</h3>;
        } else if (speech === null || speech === undefined) {
            speechContent = <h3 style={{textAlign: "center", padding: 24, fontSize: "1.5em"}}>Loading</h3>;
        } else {
            let speaker = UserStore.getUser(speech.user_id);
            let user = LoginStore.getUser();

            let showEditDelete = speech.status === ActivityConstants.SPEECH_STATUS.NEW && speech.user_id === user.id;
            let dialogActions = [
                <MUI.FlatButton
                    label="Cancel"
                    secondary={true}
                    onTouchTap={this._handleDeleteDialogCancel}/>,
                <MUI.FlatButton
                    label="Delete"
                    primary={true}
                    onTouchTap={this._handleDeleteDialogSubmit}/>
            ];
            bar = (<Flex.Layout flex={1} center horizontal style={styles.bar}>
                <Flex.Layout>
                    <MUI.IconButton onClick={() => history.back()} iconStyle={{color: this.context.muiTheme.palette.canvasColor}} iconClassName="icon-keyboard-arrow-left" />
                </Flex.Layout>
                <div title={speech.title} style={styles.title}>{speech.title}</div>
                <Flex.Layout endJustified flex={1} center horizontal>
                    <div>
                        {showEditDelete ? <Link to="edit-speech" params={{ id: this.state.speech.id }}><MUI.IconButton iconStyle={{color: this.context.muiTheme.palette.canvasColor}} iconClassName="icon-edit"/></Link> : undefined}
                        {showEditDelete ? <MUI.IconButton onClick={this._deleteSpeech} iconStyle={{color: this.context.muiTheme.palette.canvasColor}} iconClassName="icon-delete"/> : undefined}
                    <MUI.Dialog actions={dialogActions} title="Deleting Speech" ref='deleteDialog'>
                        Are you sure to delete this speech?
                    </MUI.Dialog>
                    </div>
                </Flex.Layout>
            </Flex.Layout>);

            speechSpeaker = <Flex.Layout horizontal style={styles.detailItem}>
                <Flex.Layout center style={styles.detailKey}><MUI.FontIcon className="icon-person" title="Speaker"/></Flex.Layout>
                <Flex.Layout center onClick={(e)=>{e.stopPropagation()}}>
                    <Member.Avatar scale={0.8} member={speaker}/>
                    <Member.Name style={{marginLeft: 4}} member={speaker}/>
                </Flex.Layout>
            </Flex.Layout>;

            speechCategory = <Flex.Layout horizontal style={styles.detailItem}>
                <Flex.Layout center style={styles.detailKey}><MUI.FontIcon className="icon-label" title="Category"/></Flex.Layout>
                <Flex.Layout center><Common.Display type="subhead">{speech.category}</Common.Display></Flex.Layout>
            </Flex.Layout>;

            if ((speech.status === ActivityConstants.SPEECH_STATUS.APPROVED && (user.id === speech.user_id || ActivityUserStore.currentIsAdmin()))
                || speech.status === ActivityConstants.SPEECH_STATUS.CONFIRMED
                || speech.status === ActivityConstants.SPEECH_STATUS.FINISHED) {
                speechTime = <Flex.Layout horizontal style={styles.detailItem}>
                    <Flex.Layout center style={styles.detailKey}><MUI.FontIcon className='icon-schedule' title="Time"/></Flex.Layout>
                    <Flex.Layout center><Common.Display
                        type="subhead">{Moment(speech.time).format('YYYY-MM-DD HH:mm')}</Common.Display></Flex.Layout>
                </Flex.Layout>;
            }

            let hour = Math.floor(speech.expected_duration / 60);
            let minute = speech.expected_duration % 60;
            speechDuration = <Flex.Layout horizontal style={styles.detailItem}>
                <Flex.Layout center style={styles.detailKey}><MUI.FontIcon className="icon-timer" title="Expected Duration"/></Flex.Layout>
                {hour > 0 ?
                    <Flex.Layout horizontal style={{marginRight: 6}}>
                        <Common.Display type="subhead">{hour} h</Common.Display>
                    </Flex.Layout>
                    : undefined}
                <Flex.Layout horizontal>
                    <Common.Display type="subhead">{minute} m</Common.Display>
                </Flex.Layout>
            </Flex.Layout>;

            speechDescription = <Flex.Layout horizontal style={styles.detailItem}>
                <Flex.Layout center style={styles.detailKey}><MUI.FontIcon className="icon-description" title="Description"/></Flex.Layout>
                <Flex.Layout top>
                    <SmartDisplay
                    value={speech.description || ""}
                    multiLine
                    style={{width: "100%", maxWidth: "100%", textOverflow: 'clip'}} />
                </Flex.Layout>
            </Flex.Layout>;

            if (speech.status === ActivityConstants.SPEECH_STATUS.CONFIRMED
                || speech.status === ActivityConstants.SPEECH_STATUS.FINISHED) {
                speechFiles = <Flex.Layout horizontal style={styles.detailItem}>
                    <Flex.Layout center style={styles.detailKey}><MUI.FontIcon className="icon-attach-file"
                                                                               title="Attachments"/></Flex.Layout>
                    {speech.resource_url ?
                        <Flex.Layout center style={{paddingRight: 12}}>
                            <a href={`/file/files/${speech.resource_url}/download`} >{speech.resource_name || 'Download'}</a>
                        </Flex.Layout> :
                        (speech.user_id != user.id ?
                            <Common.Display style={{color: this.context.muiTheme.palette.disabledColor}}>The speaker has not uploaded any attachments.</Common.Display>
                            : undefined)}
                    {speech.status === ActivityConstants.SPEECH_STATUS.CONFIRMED && speech.user_id === user.id ?
                        <FileUploader ref="fileUploader" text={`${speech.resource_url ? 'Update' : 'Upload'} Attachments`} showResult maxSize={10 * 1024 * 1024}
                                  acceptTypes={["pdf", "ppt", "rar", "zip", "rar", "gz", "tgz", "bz2"]} afterUpload={this._uploadAttachment}/> : undefined}
                </Flex.Layout>;
            }

            if (speech.status === ActivityConstants.SPEECH_STATUS.FINISHED
                || speech.status === ActivityConstants.SPEECH_STATUS.CONFIRMED) {
                let users = null;
                let tips = null;
                if (speech.status === ActivityConstants.SPEECH_STATUS.FINISHED) {
                    users = speech.participants;
                    tips = "Participants";
                } else {
                    users = speech.audiences;
                    tips = "Audiences";
                }
                if (users === undefined || users === null) users = [];
                let showJoin = true;
                for (let i = 0; i < users.length; i++) {
                    if (users[i].id === user.id) {
                        showJoin = false;
                        break;
                    }
                }
                speechAudiences = <Flex.Layout horizontal style={styles.detailItem}>
                    <Flex.Layout center style={styles.detailKey}><MUI.FontIcon className="icon-people" title={tips}/></Flex.Layout>
                    <Flex.Layout center wrap>
                        {users.map(p => {
                            let u = UserStore.getUser(p.id);
                            return <div style={{paddingRight: 12}}><Member.Avatar scale={0.8} member={u}/><Member.Name style={{marginLeft: 4}} member={u}/></div>;
                        })}
                    </Flex.Layout>
                    {speech.status === ActivityConstants.SPEECH_STATUS.CONFIRMED ?
                    <Flex.Layout center endJustified>
                        {showJoin ? <MUI.IconButton onClick={this._applyAsAudience} iconClassName="icon-add-circle-outline"/> : undefined}
                        {!showJoin ? <MUI.IconButton onClick={this._withdrawAsAudience} iconClassName="icon-remove-circle-outline"/> : undefined}
                    </Flex.Layout> : undefined}
                </Flex.Layout>;
            }

            let primaryBtn = null;
            let secondaryBtn = null;
            if (speech.user_id === user.id) {
                if (speech.status === ActivityConstants.SPEECH_STATUS.NEW)
                    primaryBtn = <MUI.RaisedButton type="submit" label="Submit" primary={true} onClick={this._submitSpeech}/>;
                else if (speech.status === ActivityConstants.SPEECH_STATUS.AUDITING)
                    primaryBtn = <MUI.RaisedButton type="submit" label="Withdraw" primary={true} onClick={this._withdrawSpeech}/>;
                else if (speech.status === ActivityConstants.SPEECH_STATUS.APPROVED) {
                    primaryBtn = <MUI.RaisedButton type="submit" label="Agree" primary={true} onClick={this._agreeArrangement}/>;
                    secondaryBtn = <MUI.RaisedButton type="submit" label="Disagree" style={{marginBottom: 12}} onClick={this._disagreeArrangement}/>;
                }
            } else if (ActivityUserStore.currentIsAdmin()) {
                if (speech.status === ActivityConstants.SPEECH_STATUS.AUDITING) {
                    primaryBtn = <MUI.RaisedButton type="submit" label="Approve" primary={true} onClick={this._showSelectTime}/>;
                    secondaryBtn = <MUI.RaisedButton type="submit" label="Reject" style={{marginBottom: 12}} onClick={this._rejectSpeech}/>;
                } else if (speech.status === ActivityConstants.SPEECH_STATUS.CONFIRMED) {
                    primaryBtn = <MUI.RaisedButton type="submit" label="Finish" primary={true} onClick={this._showRecordParticipants}/>;
                    secondaryBtn = <MUI.RaisedButton type="submit" label="Close" style={{marginBottom: 12}} onClick={this._closeSpeech}/>;
                }
            }
            speechActions = <Flex.Layout vertical style={{padding: 24}}>
                {secondaryBtn}
                {primaryBtn}
                </Flex.Layout>;

            speechComment = (<Flex.Layout vertical key="comments" style={{
                borderTop: `1px solid ${this.context.muiTheme.palette.borderColor}`,
                padding: 24
            }}>
                <Common.Display type='title'>Comments</Common.Display>
                <Thread style={{width: "100%"}} threadKey={this.state.threadKey} threadTitle={`Comment ${speech.title}`} />
            </Flex.Layout>);
            if (speech.status !== ActivityConstants.SPEECH_STATUS.CLOSED) {
                stepBar = <Flex.Layout center vertical style={{borderLeft: '1px solid ' + this.context.muiTheme.palette.borderColor, width: 180, flexShrink:0}}>
                    <StepBar vertical style={{padding:24, width:100, height:300}} activeStep={speechStatus.get(speech.status)} stepTitles={["New", "Auditing", "Approved", "Confirmed", "Finished"]}/>
                    {speechActions}
                </Flex.Layout>
            }

        }

        return (
            <PerfectScroll style={{height: '100%', position:'relative', margin: '0 auto', padding:20}}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <MUI.Paper zDepth={1} style={styles.inner}>
                        {bar}
                        <Flex.Layout>
                            <Flex.Item style={{padding: 20}} flex={1}>
                                {/*<Flex.Layout start centerJustified style={{padding: '20px 0px 30px 0px'}}>
                                    {speechActions}
                                </Flex.Layout>*/}

                                {speechSpeaker}
                                {speechCategory}
                                {speechTime}
                                {speechDuration}
                                {speechDescription}
                                {speechFiles}
                                {speechAudiences}
                                {speechContent}

                            </Flex.Item>

                            {stepBar}
                        </Flex.Layout>

                        {speechComment}
                    </MUI.Paper>
                </form>
                <MUI.Paper zDepth={1} style={styles.selectTime}>
                    <div style={{padding: '0px 20px'}}>
                        <Flex.Layout horizontal>
                            <h3>Select Time</h3>
                        </Flex.Layout>
                        {this._getTimePicker()}
                    </div>
                </MUI.Paper>
                <MUI.Paper zDepth={1} style={styles.recordParticipants}>
                    <PerfectScroll style={{height: '100%', position:'relative', padding:24}}>
                    <div style={{padding: '0px 20px'}}>
                        <Flex.Layout vertical>
                            <Flex.Layout horizontal>
                                <h3>Record Participants</h3>
                            </Flex.Layout>
                            <Member.MemberSelect
                                hintText="Select Audiences"
                                floatingLabelText="Select Audiences"
                                style={{width: "100%"}}
                                valueLink={this.linkState("audiences")}
                                team={false}/>
                            <UserTable ref="userTable" valueLink={this.linkState("audiences")}/>
                            <Flex.Layout horizontal justified style={{marginTop: 12}}>
                                <MUI.RaisedButton type="submit" label="Cancel" onClick={this._hideRecordParticipants}/>
                                <MUI.RaisedButton type="submit" label="Finish" secondary={true} onClick={this._finishSpeech}/>
                            </Flex.Layout>
                        </Flex.Layout>
                    </div>
                    </PerfectScroll>
                </MUI.Paper>
            </PerfectScroll>
        );
    },

    _showRecordParticipants() {
        this.setState({
            showRecordParticipants: !this.state.showRecordParticipants
        });
    },
    _hideRecordParticipants() {
        this.setState({showRecordParticipants: false});
    },
    _getTimePicker() {
        return (
            <Flex.Layout vertical>
                <MUI.DatePicker ref="date" hintText="Select Date" defaultDate={new Date()}/>
                <MUI.TimePicker ref="time" hintText="Select Time" format="24hr" defaultTime={new Date()}/>
                <Flex.Layout horizontal justified>
                    <MUI.RaisedButton type="submit" label="Cancel" onClick={this._hideSelectTime}/>
                    <MUI.RaisedButton type="submit" label="Approve" secondary={true} onClick={this._approveSpeech}/>
                </Flex.Layout>
            </Flex.Layout>
        );
    },
    _showSelectTime() {
        this.setState({
            showSelectTime: !this.state.showSelectTime
        });
    },
    _hideSelectTime() {
        this.setState({showSelectTime: false});
    },

    _deleteSpeech() {
        this.refs.deleteDialog.show();
    },
    _handleDeleteDialogCancel() {
        this.refs.deleteDialog.dismiss();
    },
    _handleDeleteDialogSubmit() {
        ActivityAction.deleteActivity(this.state.speech.id, () => {
            this.context.router.transitionTo("activity");
        });
    },
    _submitSpeech() {
        ActivityAction.submitActivity(this.state.speech.id, speech => {
            this.setState({
                speech: speech
            })
        });
    },
    _withdrawSpeech() {
        ActivityAction.withdrawActivity(this.state.speech.id, speech => {
            this.setState({
                speech: speech
            })
        });
    },
    _applyAsAudience() {
        ActivityAction.applyAsAudience(this.state.speech.id, LoginStore.getUser().id, speech => {
            this.setState({
                speech: speech
            })
        });
    },
    _withdrawAsAudience() {
        ActivityAction.withdrawAsAudience(this.state.speech.id, LoginStore.getUser().id, speech => {
            this.setState({
                speech: speech
            })
        });
    },
    _approveSpeech() {
        let date = this.refs.date.getDate();
        let time = this.refs.time.getTime();
        let datetime = new Date(date.getFullYear(),date.getMonth(),date.getDate(),time.getHours(),time.getMinutes(), 0, 0);
        ActivityAction.approveActivity(this.state.speech.id, datetime, speech => {
            this.setState({
                speech: speech,
                showSelectTime: false
            })
        });
    },

    _rejectSpeech() {
        ActivityAction.rejectActivity(this.state.speech.id, speech => {
            this.setState({
                speech: speech
            })
        });
    },
    _agreeArrangement() {
        ActivityAction.agreeArrangement(this.state.speech.id, speech => {
            this.setState({
                speech: speech
            })
        });
    },
    _disagreeArrangement() {
        ActivityAction.disagreeArrangement(this.state.speech.id, speech => {
            this.setState({
                speech: speech
            })
        });
    },
    _finishSpeech() {
        let audiences = this.state.audiences;
        if( Object.prototype.toString.call(audiences) !== '[object Array]' ) {
            audiences = [];
        }
        ActivityAction.finishSpeech(this.state.speech, audiences, this.refs.userTable.getSelectedUsers(), speech => {
            this.setState({
                speech: speech,
                showRecordParticipants: false
            })
        });
    },
    _closeSpeech() {
        ActivityAction.closeSpeech(this.state.speech.id, speech => {
            this.setState({
                speech: speech
            })
        });
    },
    _uploadAttachment(result) {
        if (result.result === Constants.UploadResult.SUCCESS) {
            console.log(result.file);
            ActivityAction.uploadAttachment(this.state.speech.id, result.file.id, result.file.name, speech => {
                this.setState({
                    speech: speech
                })
            });
        }

    },
    _onChange(){
        let params = this.props.params;

        this.setState({
            speech: ActivityStore.getSpeech(params.id)
        });
    }
});
