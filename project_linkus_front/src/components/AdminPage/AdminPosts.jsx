import { useEffect, useState } from "react";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPosts(0);
  }, []);

  const fetchPosts = async (pageNum = 0) => {
    try {

      const res = await getCommonApi().get(`/admin/posts/findall?page=${pageNum}&size=20`);
      setPosts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(pageNum);
    } catch (error) {
      console.error("게시글 조회 실패", error);
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm(`${postId}번 게시글을 정말 삭제하시겠습니까?`)) {
      try {
        await getCommonApi().delete(`/admin/posts/${postId}`);
        alert("삭제되었습니다.");
        // 2. 삭제 후 현재 페이지 정보를 그대로 유지하며 목록 새로고침
        fetchPosts(page); 
      } catch (error) {
        alert("삭제 실패: " + error.message);
      }
    }
  };

  return (
    <div>
      <h3>전체 게시글 목록</h3>
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>작성자</th>
            <th>내용</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.postId}>
              <td>{post.postId}</td>
              <td>{post.userId}</td>
              <td>{post.text}</td>
              <td>
                <button onClick={() => deletePost(post.postId)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      <div className="pagination-container">
        <button 
          className="page-btn"
          disabled={page === 0} 
          onClick={() => fetchPosts(page - 1)} 
        >
          이전
        </button>
        
        <span className="page-info">{page + 1} / {totalPages}</span>
        
        <button 
          className="page-btn"
          disabled={page >= totalPages - 1} 
          onClick={() => fetchPosts(page + 1)} 
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default AdminPosts;