import React, {useState} from 'react';
import NavigationMap from './NavigationMap';
import NavigationSidebar from './NavigationSidebar';
import './Navigation.css';

const NavigationDemo = () => {
  const [start, setStart] = useState(null); // {lat, lng}
  const [end, setEnd] = useState(null);
  const [naviState, setNaviState] = useState(null);
  const [profile, setProfile] = useState('driving');
  const [following, setFollowing] = useState(true);

  return (
    <div className="navigation-root flex h-full">
      <div className="map-pane flex-1">
        <NavigationMap
          start={start}
          end={end}
          profile={profile}
          following={following}
          onStartChange={setStart}
          onEndChange={setEnd}
          onStateChange={setNaviState}
        />
      </div>
      <div className="sidebar-pane w-96 bg-zinc-900 text-white">
        <NavigationSidebar
          start={start}
          end={end}
          naviState={naviState}
          profile={profile}
          onProfileChange={setProfile}
          following={following}
          onFollowingChange={setFollowing}
          onSetEnd={setEnd}
        />
      </div>
    </div>
  );
};

export default NavigationDemo;
