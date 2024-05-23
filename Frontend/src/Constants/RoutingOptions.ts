import { SlMusicToneAlt } from "react-icons/sl";
import { BiSolidPlaylist } from "react-icons/bi";
import { MdOutlineLibraryMusic } from "react-icons/md";
import { GiMicrophone } from "react-icons/gi";

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
        icon: BiSolidPlaylist,
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