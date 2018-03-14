import React from "react";

class Rover extends React.Component {
    render() {
        const { facing, ghost } = this.props;
        return <span className={`rover ${facing} ${ghost ? 'ghost' : ''} `}>🛦</span>
    }
};

export default Rover;