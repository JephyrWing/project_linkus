package com.my.project_linkus_back.posts.repository;

import com.my.project_linkus_back.posts.entity.Posts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Posts, Long> {
    @Query(value = """
            SELECT *
            FROM posts
            WHERE (
                    ST_X(location) BETWEEN :swLongitude AND :neLongitude
                    AND ST_Y(location) BETWEEN :swLatitude AND :neLatitude
                  )
               OR (
                    ST_Y(location) BETWEEN :swLongitude AND :neLongitude
                    AND ST_X(location) BETWEEN :swLatitude AND :neLatitude
                  )
            """, nativeQuery = true)
    List<Posts> postsContainedCurrentMap(
            @Param("swLatitude") Double swLatitude,
            @Param("swLongitude") Double swLongitude,
            @Param("neLatitude") Double neLatitude,
            @Param("neLongitude") Double neLongitude
    );

    List<Posts> findByUser_UserId(String userId);

    @Query("SELECT p.post FROM PostLikes p WHERE p.user.userId = :userId")
    List<Posts> findPostsByUserId(@Param("userId") String userId);
}
