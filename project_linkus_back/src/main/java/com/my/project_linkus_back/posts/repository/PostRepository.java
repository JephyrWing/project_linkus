package com.my.project_linkus_back.posts.repository;

import com.my.project_linkus_back.posts.entity.Posts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Posts, Long> {
    @Query(value = "SELECT * FROM Posts WHERE MBRContains(LineString(Point(:swLongitude, :swLatitude), Point(:neLongitude, :neLatitude)), POINT(ST_X(location), ST_Y(location)))", nativeQuery = true)
    List<Posts> postsContainedCurrentMap(
            @Param("swLatitude") String swLatitude,
            @Param("swLongitude") String swLongitude,
            @Param("neLatitude") String neLatitude,
            @Param("neLongitude") String neLongitude
    );
    List<Posts> findByUser_UserId(String userId);

    @Query("SELECT p.post FROM PostLikes p WHERE p.user.userId = :userId")
    List<Posts> findPostsByUserId(@Param("userId") String userId);
}
