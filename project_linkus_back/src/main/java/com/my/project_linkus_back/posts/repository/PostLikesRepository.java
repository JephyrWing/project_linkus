package com.my.project_linkus_back.posts.repository;

import com.my.project_linkus_back.posts.entity.PostLikes;
import com.my.project_linkus_back.posts.entity.Posts;
import com.my.project_linkus_back.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikesRepository extends JpaRepository<PostLikes, Long> {

    boolean existsByPostAndUser(Posts post, Users user);

    boolean existsByPost_IdAndUser_UserId(Long postId, String userId);

    void deleteByPost_IdAndUser_UserId(Long postId, String userId);

    void deleteByPostId(Long postId);

    int countByPost(Posts post);

    void deleteByUser(Users user);
}
