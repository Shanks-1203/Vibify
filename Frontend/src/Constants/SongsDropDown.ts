import { PiQueue } from "react-icons/pi";
import { HiOutlineQueueList } from "react-icons/hi2";
import { CgPlayListAdd } from "react-icons/cg";

export const songsDropDown = [
    {
        icon: PiQueue,
        name: 'Play Next',
        function: 'pn'
    },
    {
        icon: HiOutlineQueueList,
        name: 'Add to Queue',
        function: 'atq'
    },
    {
        icon: CgPlayListAdd,
        name: 'Save to Playlist',
        function: 'stp'
    }
]