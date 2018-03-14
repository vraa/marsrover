import React from "react";
import { render } from "react-dom";
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

    state = {
        start: null,
        end: null,
        ops: [],
        position: "",
        facing: "",
        path: {}
    };

    componentDidMount() {
        this.process(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.process(nextProps);
    }

    process = (props) => {
        const { commands, position, execute } = props;
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
    };

    execute = (commands) => {
        let ops = (commands || "").split("");
        this.setState({ ops }, () => {
            setTimeout(this.run.bind(this), 500);
        });
    };

    run = () => {
        let ops = this.state.ops.slice();
        let { position, path, facing } = this.state;
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
        } this.setState(Object.assign(this.state, {
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

    }

    moveRoverForward = () => {
        const { size } = this.props;
        const { position, facing } = this.state;
        const moveVector = MOVE_VECTOR[facing];
        const pos = position.split('-').map(Number);
        const x = pos[0] + moveVector[0];
        const y = pos[1] + moveVector[1];
        if (x < 0 || x >= size || y < 0 || y >= size) {
            return { error: true };
        }
        return {
            position: x + '-' + y
        };
    }

    turnRoverLeft = () => {
        const { facing } = this.state;
        return ({
            facing: LEFT_TURNS_MAP[facing]
        });
    }

    turnRoverRight = () => {
        const { facing } = this.state;
        return ({
            facing: RIGHT_TURNS_MAP[facing]
        });
    }

    render() {
        const { size } = this.props;
        let { position, facing, path } = this.state;
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
                    let cellIcon = null;
                    if (this.state.error && this.state.end === cell) {
                        cellIcon = <i className='icon error'>🛑</i>;
                    } else if (this.state.start === cell) {
                        cellIcon = <i className='icon start'>🚩</i>;
                    } else if (this.state.end === cell) {
                        cellIcon = <i className='icon end'>🎌</i>;
                    }
                    if (position === cell) {
                        roverElm = <Rover facing={facing} />;
                    } else {
                        roverPath = (path[cell] ? <Rover facing={path[cell]} ghost={true} /> : null);
                    }
                    return (
                        <li className={`cell ${!!path[cell] ? 'path' : ''}`} key={cell}>
                            <label>{cell}</label>
                            {roverElm || roverPath}
                            {cellIcon}
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
        execute: false
    }

    addCommand = (e) => {
        this.setState({
            commands: this.state.commands + e.target.value
        })
    }

    execute = () => {
        this.setState({
            execute: true
        });
    }

    clear = () => {
        this.setState({
            commands: '',
            execute: false
        })
    }

    render() {
        return (
            <div>
                <h1 className={'app-name'}>Mars Rover in JavaScript / React</h1>
                <div className='control-panel'>
                    <label>Build Commands</label>
                    <div className='commands'>
                        <button value='L' onClick={this.addCommand}>Left</button>
                        <button value='R' onClick={this.addCommand}>Right</button>
                        <button value='M' onClick={this.addCommand}>Move</button>
                    </div>
                    <div className='execution'>
                        <button onClick={this.clear} className='secondary'>✖</button>
                        <input type="text" readOnly value={this.state.commands} />
                        <button className={'cta'} onClick={this.execute}>Execute</button>
                    </div>

                </div>
                <Mars
                    size={5}
                    position={"0 0 N"}
                    commands={this.state.commands}
                    execute={this.state.execute}
                />
            </div>
        )
    }
}

render(<App />, document.getElementById("root"));
