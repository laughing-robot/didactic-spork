function room_factory(room_type) {

    if (room_type == 'FrontDesk') {
        return create_reception;
    }

    return 'goodToGo';
};

function create_reception(parent_node) {
    return 'lez_guuu';
};


export {room_factory};