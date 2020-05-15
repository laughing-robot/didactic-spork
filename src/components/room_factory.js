import { Reception } from '~/components/reception_room'

function roomFactory(room_type) {

    if (room_type == 'FrontDesk') {
        //return create_reception;
        let reception = new Reception(10);
        return reception.buildRoom();
    }

    return 'goodToGo';
};

function create_reception(parent_node) {
    // in here do it
    //
    // calculate random values

    return '<a-box color="red" depth="5" width="5" height="20.00" position=""></a-box><a-box color=blue depth="5" height="15.00" position="10 0 10"><a-sphere color="yellow" radius="5"></a-sphere></a-box>';
};


export {roomFactory};
