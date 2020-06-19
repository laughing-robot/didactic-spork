import { LobbyTile } from '~/rooms/reception_room'
import { ArtTile } from '~/rooms/art_tile'

function tileFactory(tileProps) {

    switch(tileProps.room_type) {
        case "art_tile":
            let art_tile = new ArtTile();
            return art_tile.buildTile(tileProps);
            break;
        case "news_tile":
            break;
        case "lobby_tile":
            let lobby_tile = new LobbyTile();
            return lobby_tile.buildTile(tileProps);
            break;
    }

    throw "Unexpected room request";
};

export {tileFactory};
