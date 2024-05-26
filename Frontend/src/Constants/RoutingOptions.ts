import { SlMusicToneAlt } from "react-icons/sl";
import { MdOutlineLibraryMusic } from "react-icons/md";
import { GiMicrophone } from "react-icons/gi";
import { PiPlaylist } from "react-icons/pi";

interface Route {
    icon: any
    name: String
    route: String
}

const routes:Route[] = [
    {
        icon: SlMusicToneAlt,
        name: 'Home',
        route: ''
    },
    {
        icon: PiPlaylist,
        name: 'Playlists',
        route: 'playlists'
    },
    {
        icon: GiMicrophone,
        name: 'Artists',
        route: 'artists'
    },
    {
        icon: MdOutlineLibraryMusic,
        name: 'Library',
        route: 'library'
    },
]

export default routes