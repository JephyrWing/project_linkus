package com.my.project_linkus_back.posts.repository;

import com.my.project_linkus_back.posts.entity.Posts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Posts, Long> {
    @Query(value = "SELECT * FROM Posts WHERE ST_Contains(ST_MakeEnvelope(POINT(:swLongitude, :swLatitude), POINT(:neLongitude, :neLatitude)), location)", nativeQuery = true)
    public List<Posts> postsContainedCurrentMap(@Param("swLatitude") String swLatitude, @Param("swLongitude")String swLongitude, @Param("neLatitude")String neLatitude, @Param("neLongitude")String neLongitude);
}
