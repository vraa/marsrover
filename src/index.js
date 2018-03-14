import React from "react";
import {render} from "react-dom";
import "./index.css";
import Rover from "./rover";

const MOVE_VECTOR = {
    S: [0, -1],
    W: [-1, 0],
    N: [0, 1],
    E: [1, 0]
};

const LEFT_TURNS_MAP = {
    N: "W",
    W: "S",
    S: "E",
    E: "N"
};

const RIGHT_TURNS_MAP = {
    N: "E",
    E: "S",
    S: "W",
    W: "N"
};


class Mars extends React.Component {

    initialState = {
        start: null,
        end: null,
        ops: [],
        position: "0-0",
        facing: "N",
        path: null,
        error: null,
    };

    state = Object.assign({}, this.initialState);

    componentDidMount() {
        this.reset(() => {
            this.process(this.props);
        });
    }

    componentWillReceiveProps(nextProps) {
        this.reset(() => {
            this.process(nextProps);
        });
    }

    reset = (cb) => {
        this.setState(this.initialState, cb);
    };

    process = (props) => {
        const {commands, position} = props;
        if (commands === '') {
            this.setState(this.initialState);
        } else {
            const parts = position.split(" ");
            this.setState(
                {
                    start: parts[0] + "-" + parts[1],
                    position: parts[0] + "-" + parts[1],
                    facing: parts[2]
                },
                () => {
                    if (props.execute) {
                        this.execute(commands);
                    }
                }
            );
        }
    };

    execute = (commands) => {
        let ops = (commands || "").split("");
        this.setState({ops}, () => {
            setTimeout(this.run.bind(this), 500);
        });
    };

    run = () => {
        let ops = this.state.ops.slice();
        let {position, path, facing} = this.state;
        path = path || {};
        path[position] = facing;
        let op = ops.shift();
        let newPosition = {};
        if (op === "L") {
            newPosition = this.turnRoverLeft();
        } else if (op === "R") {
            newPosition = this.turnRoverRight();
        } else if (op === "M") {
            newPosition = this.moveRoverForward();
        } else {
            console.log("Invalid command");
        }
        if (newPosition.error) {
            alert('Can not move beyond the boundaries of Mars');
        }
        this.setState(Object.assign(this.state, {
            ops,
            path,
            ...newPosition
        }), () => {
            if (this.state.ops.length > 0 && !this.state.error) {
                setTimeout(this.run.bind(this), 300);
            } else {
                this.setState({
                    end: this.state.position
                })
            }
        })

    };

    moveRoverForward = () => {
        const {size} = this.props;
        const {position, facing} = this.state;
        const moveVector = MOVE_VECTOR[facing];
        const pos = position.split('-').map(Number);
        const x = pos[0] + moveVector[0];
        const y = pos[1] + moveVector[1];
        if (x < 0 || x >= size || y < 0 || y >= size) {
            return {error: true};
        }
        return {
            position: x + '-' + y
        };
    };

    turnRoverLeft = () => {
        const {facing} = this.state;
        return ({
            facing: LEFT_TURNS_MAP[facing]
        });
    };

    turnRoverRight = () => {
        const {facing} = this.state;
        return ({
            facing: RIGHT_TURNS_MAP[facing]
        });
    };

    render() {

        const {size} = this.props;
        let {position, facing, path} = this.state;
        path = path || {};
        let cells = [];
        for (let i = size - 1; i >= 0; i--) {
            for (let j = 0; j < size; j++) {
                cells.push(j + "-" + i);
            }
        }
        return (
            <ul className="mars">
                {cells.map(cell => {

                    let roverElm = null;
                    let roverPath = null;
                    let cellStatus = '';

                    if (this.state.error && this.state.end === cell) {
                        cellStatus = 'error';
                    }
                    if (this.state.start === cell) {
                        cellStatus += ' start';
                    }
                    if (this.state.end === cell) {
                        cellStatus += ' end';
                    }

                    if (position === cell) {
                        roverElm = <Rover facing={facing}/>;
                    } else {
                        roverPath = (path[cell] ? <Rover facing={path[cell]} ghost={true}/> : null);
                    }

                    return (
                        <li className={`cell ${!!path[cell] ? 'path' : ''} ${cellStatus}`} key={cell}>
                            <label>{cell}</label>
                            {roverElm || roverPath}
                        </li>
                    );
                })}
            </ul>
        );
    }
}

class App extends React.Component {

    state = {
        commands: '',
        commandsToExecute: '',
        execute: false,
        startPosition: '00N'
    };

    addCommand = (e) => {
        this.setState({
            commands: this.state.commands + e.target.value
        })
    };

    runSample = (e) => {
        this.setState({
            commands: e.target.value
        });
    };

    execute = () => {
        let startPosition = this.startInput.value;
        if (/^[0-4][0-4][NEWS]$/.test(startPosition)) {
            this.setState({
                execute: true,
                commandsToExecute: this.state.commands,
                startPosition
            });
        } else {
            alert('Invalid start position.');
        }

    };

    clear = () => {
        this.setState({
            commands: '',
            execute: false,
            commandsToExecute: ''
        });
    };

    validateStartPosition = (e) => {
        e.target.checkValidity();
    };

    render() {
        let position = this.state.startPosition || '00N';
        position = position.split('').join(' ');
        return (
            <div className={'app'}>
                <h1 className={'app-name'}>Mars Rover in JavaScript / React</h1>
                <a className={'source'} href={'https://github.com/vraa/marsrover'} title={'Source code for Mars Rover in JavaScript / React'}>Source</a>
                <div className='control-panel'>
                    <div className={'start-position'}>
                        <label
                            htmlFor="startPosition"
                        >
                            Start Position (Eg; 00N):
                        </label>
                        <input type="text"
                               id="startPosition"
                               maxLength={3}
                               required
                               pattern={'^[0-4][0-4][NEWS]$'}
                               defaultValue={'00N'}
                               onBlur={this.validateStartPosition}
                               ref={(elm)=>{this.startInput = elm}}
                        />
                    </div>
                    <div className='commands'>
                        <button value='M' onClick={this.addCommand}>Move</button>
                        <button value='L' onClick={this.addCommand}>Left</button>
                        <button value='R' onClick={this.addCommand}>Right</button>
                    </div>
                    <div className='execution'>
                        <button onClick={this.clear} className='secondary'>✖</button>
                        <input type="text" readOnly value={this.state.commands}/>
                        <button className={'cta'} onClick={this.execute}>Execute</button>
                    </div>
                    <div className='samples'>
                        <label>Sample: </label>
                        <ul>
                            <li>
                                <button value={'MMRMMLMMRM'} onClick={this.runSample}>MMRMMLMMRM</button>
                            </li>
                            <li>
                                <button value={'RMMMLMRMLM'} onClick={this.runSample}>RMMMLMRMLM</button>
                            </li>
                        </ul>
                    </div>
                </div>
                <Mars
                    size={5}
                    position={position}
                    commands={this.state.commandsToExecute}
                    execute={this.state.execute}
                />
            </div>
        )
    }
}

render(<App/>, document.getElementById("root"));
