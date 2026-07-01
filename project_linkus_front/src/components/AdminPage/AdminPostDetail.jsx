import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";
import { Map, MapMarker } from "react-kakao-maps-sdk"; 

function AdminPostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const res = await getCommonApi().get(`/posts/${postId}`);
        console.log("관리자 상세 페이지 데이터 확인:", res.data);
        
        setPost(res.data);
      } catch (e) {
        console.error("게시글 상세 조회 실패:", e);
        alert("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetail();
  }, [postId]);

  if (loading) return <div className="admin-container">로딩 중...</div>;
  if (!post) return <div className="admin-container">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="container-md mt-5" style={{ maxWidth: "1000px" }}>
      <h2 className="mb-4">
        게시글 상세 정보
      </h2>
      
      <div className="bg-white border rounded shadow-sm p-4">
        <table className="table table-borderless">
          <tbody>
            <tr>
              <th style={{ width: "150px" }}>작성자</th>
              <td>{post.nickName || post.userId}</td>
            </tr>
            <tr>
              <th>좋아요</th>
              <td>{post.likeNum ?? 0}</td>
            </tr>
            <tr>
              <th>위치 (좌표)</th>
              <td>
                <span className="text-muted">
                  {post.latitude && post.longitude 
                  ? `위도: ${post.latitude}, 경도: ${post.longitude}` 
                  : "좌표 정보 없음"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        <div className="mt-4">
          <h5 className="mb-3">내용</h5>
          <div className="p-3 bg-light rounded" style={{ minHeight: "150px", border: "1px solid #eee" }}>
            {post.text}
          </div>
        </div>

        {post.imageUrl && (
          <div className="mt-4">
            <h5 className="mb-3">첨부 사진</h5>
            <img src={post.imageUrl} alt="게시글 이미지" className="img-fluid rounded border" style={{ maxHeight: "300px" }} />
          </div>
        )}

        <div className="mt-4">
          <h5 className="mb-3">위치 확인</h5>
          <Map
            center={{ lat: post.latitude, lng: post.longitude }}
            style={{ width: "100%", height: "300px" }}
            level={3}
          >
            <MapMarker position={{ lat: post.latitude, lng: post.longitude }} />
          </Map>
        </div>  
      </div>
      <div className="mt-4 d-flex justify-content-end">
          <button onClick={() => navigate(-1)} className="btn btn-secondary px-4">
            목록으로 돌아가기
          </button>
        </div>
    </div>
  );
}

export default AdminPostDetail;
