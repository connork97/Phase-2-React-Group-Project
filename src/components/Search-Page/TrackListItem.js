import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { BsList } from "react-icons/bs";
import { FaRegHeart, FaHeart } from "react-icons/fa";



const TrackListItem = ({ track, artistName, albumImage, accessToken, allPlaylists, setAllPlaylists, generalToggle, setGeneralToggle, handleLikedSong }) => {
    
    const [backupPreview, setBackupPreview] = useState("");
    const [isFetched, setIsFetched] = useState(false);
    const [isPlaylistClicked, setIsPlaylistClicked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    
    const history = useHistory();
    
    console.log(track)
    
    const likedSong = {
        song_id: track.id,
        song_name: track.name,
        song_link: track.external_urls.spotify,
        artists_id: track.artists[0].id,
        artists: track.artists[0].name,
        artists_link: track.artists[0].external_urls.spotify,
        image: albumImage,
        preview_url: backupPreview
    }
    
    const onLikeButtonClick = () => {
        setIsLiked(!isLiked)
        handleLikedSong(likedSong)
    }

    useEffect(() => {
        fetch('https://api.spotify.com/v1/search?q=' + track.name + '&type=track', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            }
        })
        .then((response) => response.json())
        .then((data) => {
            filterBackups(data.tracks.items)
        })
    }, [])
    
    const filterBackups = (generalBackups) => {
        const backupObj = generalBackups.find((backup) => backup.artists[0].name.toLowerCase() == artistName.toLowerCase())
        let verifiedBackupObj;
        if (backupObj !== undefined) {
            verifiedBackupObj = backupObj
            setIsFetched(true)
        }
        setBackupPreview(verifiedBackupObj.preview_url)
    }

    const dropDownOptions = () => {
        return allPlaylists.map((playlist) => {
            return <Dropdown.Item style={{zIndex:"15"}} onClick={() => handleAddToPlaylist(playlist)}>{playlist.name}</Dropdown.Item>
        })
    }

    const handleAddToPlaylist = (playlist) => {
        console.log(playlist.songs)
        fetch(`http://localhost:8000/playlists/${playlist.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                songs: [
                    ...playlist.songs,
                    likedSong
                ]
            })
        })
        .then((response) => response.json())
        .then((addedSongData) => console.log(addedSongData))
        setAllPlaylists([...allPlaylists, likedSong])
        handleToggle()
    }

    const handleToggle = () => {
        setGeneralToggle(!generalToggle)
    }

    const handleCreateNewPlaylist = () => {
        history.push({pathname:"/playlists/new-playlist"})
    }

    return (
        <>
            {isFetched ?
            <span style={{display:"flex", zIndex:"10", justifyContent:"space-between", alignItems:"center"}}>
                <audio controls name="media" style={{position:"absolute", right:"175px", height:"50px", width:"350px", alignItems:"center", justifyContent:"flex-end"}}>
                    <source src={backupPreview} alt="no preview available" type="audio/mp3" />
                </audio>
                {isLiked ? 
                <FaHeart onClick={() => window.alert("You've already liked this post!")} style={{cursor:"pointer", position:"absolute", right:"125px", scale:"2.5", color:"#E31B23"}} />            
                : <FaRegHeart onClick={onLikeButtonClick} style={{cursor:"pointer", position:"absolute", right:"125px", color:"#E31B23", scale:"2.5"}} />
                }
                <Dropdown style={{zIndex:"8", left:"555px"}}>
                    <Dropdown.Toggle variant="none" style={{marginBottom:"10px", zIndex:"5"}}>
                        <BsList type="select" onClick={() => setIsPlaylistClicked(!isPlaylistClicked)} style={{display:"inline-flex", cursor:"pointer", scale:"2", zIndex:"5"}} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{zIndex:"15"}}>
                        <span style={{display:"flex", justifyContent:"center"}}><strong>Add to...</strong></span>
                        <Dropdown.Item style={{zIndex:"15"}} onClick={() => handleCreateNewPlaylist()}>New Playlist</Dropdown.Item>
                    {dropDownOptions()}
                    </Dropdown.Menu>
                </Dropdown>
            </span>
            : <span style={{position:"absolute", right:"75px", width:"350px", alignItems:"center", justifyContent:"flex-end"}}>Preview Not Available</span>}
        </>
    )
}

export default TrackListItem;