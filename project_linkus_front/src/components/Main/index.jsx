import LiveChat from "../LiveChat";
import MapPost from "../MapPost";
import "./main.css";

function Main() {
  return (
    <div className="main-container">
      <div className="map-chat-wrapper">
        <MapPost />
        <LiveChat />
      </div>
    </div>
  );
}

export default Main;