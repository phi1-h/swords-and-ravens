import * as React from "react";
import {Component, ReactNode} from "react";
import GameClient from "./GameClient";
import {observer} from "mobx-react";
import IngameGameState from "../common/ingame-game-state/IngameGameState";
import MapComponent from "./MapComponent";
import MapControls from "./MapControls";
import ListGroup from "react-bootstrap/ListGroup";
import ListGroupItem from "react-bootstrap/ListGroupItem";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import renderChildGameState from "./utils/renderChildGameState";
import WesterosGameState from "../common/ingame-game-state/westeros-game-state/WesterosGameState";
import WesterosGameStateComponent from "./game-state-panel/WesterosGameStateComponent";
import PlanningGameState from "../common/ingame-game-state/planning-game-state/PlanningGameState";
import PlanningComponent from "./game-state-panel/PlanningComponent";
import ActionGameState from "../common/ingame-game-state/action-game-state/ActionGameState";
import ActionComponent from "./game-state-panel/ActionComponent";
import houseInfluenceImages from "./houseInfluenceImages";
import * as _ from "lodash";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons/faStar";
import Tooltip from "react-bootstrap/Tooltip";
import Badge from "react-bootstrap/Badge";
import barrelImage from "../../public/images/icons/barrel.svg";
import stoneThroneImage from "../../public/images/icons/stone-throne.svg";
import ravenImage from "../../public/images/icons/raven.svg";
import diamondHiltImage from "../../public/images/icons/diamond-hilt.svg";
import hourglassImage from "../../public/images/icons/hourglass.svg";
import mammothImage from "../../public/images/icons/mammoth.svg";
import chatBubble from "../../public/images/icons/chat-bubble.svg";
import speaker from "../../public/images/icons/speaker.svg";
import speakerOff from "../../public/images/icons/speaker-off.svg";
import House from "../common/ingame-game-state/game-data-structure/House";
import marked from "marked";
import GameLogListComponent from "./GameLogListComponent";
import Game from "../common/ingame-game-state/game-data-structure/Game";
import GameEndedGameState from "../common/ingame-game-state/game-ended-game-state/GameEndedGameState";
import GameEndedComponent from "./game-state-panel/GameEndedComponent";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import ChatComponent from "./chat-client/ChatComponent";
import {HouseCardState} from "../common/ingame-game-state/game-data-structure/house-card/HouseCard";
import HouseCardBackComponent from "./game-state-panel/utils/HouseCardBackComponent";
import InfluenceIconComponent from "./game-state-panel/utils/InfluenceIconComponent";
import Dropdown from "react-bootstrap/Dropdown";
import User from "../server/User";
import Player from "../common/ingame-game-state/Player";
import {observable} from "mobx";
import classNames = require("classnames");
import {Channel} from "./chat-client/ChatClient";
// @ts-ignore
import ScrollToBottom from "react-scroll-to-bottom";
import GameSettingsComponent from "./GameSettingsComponent";
import HouseRowComponent from "./HouseRowComponent";

interface IngameComponentProps {
    gameClient: GameClient;
    gameState: IngameGameState;
}

@observer
export default class IngameComponent extends Component<IngameComponentProps> {
    mapControls: MapControls = new MapControls();
    @observable currentOpenedTab = "chat";

    get game(): Game {
        return this.props.gameState.game;
    }

    render(): ReactNode {
        const phases: {name: string; gameState: any; component: typeof Component}[] = [
            {name: "Westeros", gameState: WesterosGameState, component: WesterosGameStateComponent},
            {name: "Planning", gameState: PlanningGameState, component: PlanningComponent},
            {name: "Action", gameState: ActionGameState, component: ActionComponent}
        ];

        return (
            <>
                <Col xs={12} lg={3}>
                    <Row className="stackable">
                        <Col>
                            <Card>
                                <ListGroup variant="flush">
                                    <ListGroupItem>
                                        <Row className="justify-content-between" style={{fontSize: "24px"}}>
                                            <Col xs="auto">
                                                <OverlayTrigger overlay={
                                                        <Tooltip id="turn">
                                                            <b>Turn</b>
                                                        </Tooltip>
                                                    }
                                                    placement="bottom">
                                                    <div>
                                                        <img src={hourglassImage} style={{marginRight: "5px"}} width={32}/>
                                                        {this.game.turn}
                                                    </div>
                                                </OverlayTrigger>
                                            </Col>
                                            <Col xs="auto">
                                                <OverlayTrigger overlay={
                                                        <Tooltip id="wildling-strength">
                                                            <b>Wildling Strength</b>
                                                        </Tooltip>
                                                    }
                                                    placement="bottom"
                                                >
                                                    <div>
                                                        {this.game.wildlingStrength}
                                                        <img src={mammothImage} width={32} style={{marginLeft: "5px"}}/>
                                                    </div>
                                                </OverlayTrigger>
                                            </Col>
                                        </Row>
                                    </ListGroupItem>
                                    {this.tracks.map(({tracker, stars}, i) => (
                                        <ListGroupItem key={i}>
                                            <Row className="align-items-center">
                                                <Col xs="auto" className="text-center" style={{width: "46px"}}>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip id={`tooltip-tracker-${i}`}>
                                                                {i == 0 ? (
                                                                    <>
                                                                        <b>Iron Throne Track</b><br />
                                                                        All ties (except military ones) are decided by the holder
                                                                        of the Iron Throne.<br />
                                                                        Turn order is decided by this tracker.
                                                                    </>
                                                                ) : i == 1 ? (
                                                                    <>
                                                                        <b>Fiefdoms Track</b><br />
                                                                        Once per turn, the holder of Valyrian Steel Blade can use the blade
                                                                        to increase by one the combat strength of his army in a combat.<br />
                                                                        In case of a tie in a combat, the winner is the house which is
                                                                        the highest in this tracker.<br/><br/>
                                                                        {this.props.gameState.game.valyrianSteelBladeUsed ? (
                                                                            <>The Valyrian Steel Blade has been used this turn</>
                                                                        ) : (
                                                                            <>The Valyrian Steel Blade is available</>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <b>Kings&apos;s Court Track</b><br />
                                                                        At the end of the Planning Phase, the holder of the Raven may choose
                                                                        to either change one of his placed order, or to see the top card of the
                                                                        wildling deck and decide whether to leave it at the top or to
                                                                        place it at the bottom of the deck.
                                                                    </>
                                                                )}
                                                            </Tooltip>
                                                        }
                                                        placement="right"
                                                    >
                                                        <img src={i == 0 ? stoneThroneImage : i == 1 ? diamondHiltImage : ravenImage} width={32}/>
                                                    </OverlayTrigger>
                                                </Col>
                                                {tracker.map((h, i) => (
                                                    <Col xs="auto" key={h.id}>
                                                        <InfluenceIconComponent
                                                            house={h}
                                                        />
                                                        <div className="tracker-star-container">
                                                            {stars && i < this.game.starredOrderRestrictions.length && (
                                                                _.range(0, this.game.starredOrderRestrictions[i]).map(i => (
                                                                    <div key={i}>
                                                                        <FontAwesomeIcon
                                                                            style={{color: "#ffc107", fontSize: "9px"}}
                                                                            icon={faStar}/>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </ListGroupItem>
                                    ))}
                                    <ListGroupItem>
                                        <Row>
                                            <Col xs="auto">
                                                <img width="32px" src={barrelImage} alt="Supply"/>
                                            </Col>
                                            <Col>
                                                <Row className="justify-content-center">
                                                    {this.game.supplyRestrictions.map((allowedArmies, i) => (
                                                        <Col xs="auto" key={i} className="d-flex flex-column align-items-center">
                                                            <div>
                                                            <Badge variant="secondary" style={{fontSize: "14px"}}>
                                                                {i}
                                                            </Badge>
                                                            </div>
                                                            <div className="d-flex">
                                                                <div style={{width: "18px", marginRight: "6px", marginTop: "10px"}}>
                                                                    {this.getHousesAtSupplyLevel(i).map(h => (
                                                                        <OverlayTrigger
                                                                            key={h.id}
                                                                            overlay={
                                                                                <Tooltip id={`supply-house-${h.id}`}>
                                                                                    {h.name}
                                                                                </Tooltip>
                                                                            }
                                                                            placement="right">
                                                                            <div
                                                                                key={h.id}
                                                                                className="supply-icon hover-weak-outline"
                                                                                style={{
                                                                                    backgroundImage: `url(${houseInfluenceImages.get(h.id)})`,
                                                                                    marginTop: "-5px"
                                                                                }}
                                                                            >

                                                                            </div>
                                                                        </OverlayTrigger>
                                                                    ))}
                                                                </div>
                                                                <div>
                                                                    {allowedArmies.map((size, i) => (
                                                                        <div style={{marginBottom: "-6px"}} key={i}>
                                                                            {size}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Col>
                                        </Row>
                                    </ListGroupItem>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="stackable">
                        <Col>
                            <Card>
                                <ListGroup variant="flush">
                                    {this.game.houses.values.map(h => (
                                        <HouseRowComponent
                                            key={h.id}
                                            gameClient={this.props.gameClient}
                                            ingame={this.props.gameState}
                                            house={h}
                                        />
                                    ))}
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="auto">
                            <button className="btn btn-outline-light btn-sm" onClick={() => this.props.gameClient.muted = !this.props.gameClient.muted}>
                                <img src={this.props.gameClient.muted ? speakerOff : speaker} width={32}/>
                            </button>
                        </Col>
                    </Row>
                </Col>
                <Col xs="auto">
                    <div>
                        <MapComponent
                            gameClient={this.props.gameClient}
                            ingameGameState={this.props.gameState}
                            mapControls={this.mapControls}
                        />
                    </div>
                </Col>
                <Col xs={12} lg={3}>
                    <Row className="stackable">
                        <Col>
                            <Card border={this.props.gameClient.isOwnTurn() ? "warning" : undefined}>
                                <ListGroup variant="flush">
                                    {phases.some(phase => this.props.gameState.childGameState instanceof phase.gameState) && (
                                        <ListGroupItem>
                                            <Row className="justify-content-between">
                                                {phases.map((phase, i) => (
                                                    <Col xs="auto" key={i}>
                                                        {this.props.gameState.childGameState instanceof phase.gameState ? (
                                                            <strong className="weak-outline">{phase.name} phase</strong>
                                                        ) : (
                                                            <span className="text-muted">
                                                            {phase.name} phase
                                                        </span>
                                                        )}

                                                    </Col>
                                                ))}
                                            </Row>
                                        </ListGroupItem>
                                    )}
                                    {renderChildGameState(
                                        {mapControls: this.mapControls, ...this.props},
                                        _.concat(
                                            phases.map(phase => [phase.gameState, phase.component] as [any, typeof Component]),
                                            [[GameEndedGameState, GameEndedComponent]]
                                        )
                                    )}
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Tab.Container activeKey={this.currentOpenedTab} onSelect={k => this.currentOpenedTab = k}>
                                    <Card.Header>
                                        <Nav variant="tabs">
                                            <Nav.Item>
                                                <Nav.Link eventKey="game-logs">Game Logs</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="chat" className={classNames({"new-event": this.publicChatRoom.areThereNewMessage})}>
                                                    Chat
                                                </Nav.Link>
                                            </Nav.Item>
                                            {this.props.gameClient.isOwner() && (
                                                <Nav.Item>
                                                    <Nav.Link eventKey="settings">
                                                        Settings
                                                    </Nav.Link>
                                                </Nav.Item>
                                            )}
                                            {this.getPrivateChatRooms().map(({user, roomId}) => (
                                                <Nav.Item key={roomId}>
                                                    <Nav.Link eventKey={roomId}
                                                              className={classNames({"new-event": this.getPrivateChatRoomForPlayer(user).areThereNewMessage})}>
                                                        {user.name}
                                                    </Nav.Link>
                                                </Nav.Item>
                                            ))}
                                            <Nav.Item>
                                                <Dropdown>
                                                    <Dropdown.Toggle id="private-chat-room-dropdown" variant="link">
                                                        <img src={chatBubble} width={16} />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        {this.getOtherPlayers().map(p => (
                                                            <Dropdown.Item onClick={() => this.onNewPrivateChatRoomClick(p)} key={p.user.id}>
                                                                {p.user.name}
                                                            </Dropdown.Item>
                                                        ))}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </Nav.Item>
                                        </Nav>
                                    </Card.Header>
                                    <Card.Body style={{height: "350px"}}>
                                        <Tab.Content className="h-100">
                                            <Tab.Pane eventKey="chat" className="h-100">
                                                <ChatComponent gameClient={this.props.gameClient}
                                                               entireGame={this.props.gameState.entireGame}
                                                               roomId={this.props.gameState.entireGame.publicChatRoomId}
                                                               currentlyViewed={this.currentOpenedTab == "chat"}/>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="game-logs" className="h-100">
                                                <ScrollToBottom className="h-100">
                                                    <GameLogListComponent ingameGameState={this.props.gameState} />
                                                </ScrollToBottom>
                                            </Tab.Pane>
                                            {this.getPrivateChatRooms().map(({roomId}) => (
                                                <Tab.Pane eventKey={roomId} key={roomId} className="h-100">
                                                    <ChatComponent gameClient={this.props.gameClient}
                                                                   entireGame={this.props.gameState.entireGame}
                                                                   roomId={roomId}
                                                                   currentlyViewed={this.currentOpenedTab == roomId}/>
                                                </Tab.Pane>
                                            ))}
                                            {this.props.gameClient.isOwner() && (
                                                <Tab.Pane eventKey="settings">
                                                    <GameSettingsComponent gameClient={this.props.gameClient}
                                                                        entireGame={this.props.gameState.entireGame} />
                                                </Tab.Pane>
                                            )}
                                        </Tab.Content>
                                    </Card.Body>
                                </Tab.Container>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </>
        );
    }

    get tracks(): {name: string; tracker: House[]; stars: boolean}[] {
        return [
            {name: "Iron Throne", tracker: this.game.ironThroneTrack, stars: false},
            {name: "Fiefdoms", tracker: this.game.fiefdomsTrack, stars: false},
            {name: "King's Court", tracker: this.game.kingsCourtTrack, stars: true},
        ]
    }

    get publicChatRoom(): Channel {
        return this.props.gameClient.chatClient.channels.get(this.props.gameState.entireGame.publicChatRoomId);
    }

    onNewPrivateChatRoomClick(p: Player): void {
        const users = _.sortBy([this.props.gameClient.authenticatedUser as User, p.user], u => u.id);

        if (!this.props.gameState.entireGame.privateChatRoomsIds.has(users[0]) || !this.props.gameState.entireGame.privateChatRoomsIds.get(users[0]).has(users[1])) {
            // Create a new chat room for this player
            this.props.gameState.entireGame.sendMessageToServer({
                type: "create-private-chat-room",
                otherUser: p.user.id
            });
        } else {
            // The room already exists
            // Set the current tab to this user
            this.currentOpenedTab = this.props.gameState.entireGame.privateChatRoomsIds.get(users[0]).get(users[1]);
        }
    }

    getPrivateChatRooms(): {user: User; roomId: string}[] {
        return this.props.gameState.entireGame.getPrivateChatRoomsOf(this.props.gameClient.authenticatedUser as User);
    }

    getPrivateChatRoomForPlayer(u: User): Channel {
        const users = _.sortBy([this.props.gameClient.authenticatedUser as User, u], u => u.id);

        return this.props.gameClient.chatClient.channels.get(this.props.gameState.entireGame.privateChatRoomsIds.get(users[0]).get(users[1]));
    }

    getOtherPlayers(): Player[] {
        return this.props.gameState.players.values.filter(p => p.user != this.props.gameClient.authenticatedUser);
    }

    getHousesAtSupplyLevel(supplyLevel: number): House[] {
        return this.game.houses.values.filter(h => h.supplyLevel == supplyLevel);
    }

    compileGameLog(gameLog: string): string {
        return marked(gameLog);
    }
}
