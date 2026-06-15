package com.my.project_linkus_back.posts.repository;

import com.my.project_linkus_back.posts.entity.PostLikes;
import com.my.project_linkus_back.posts.entity.Posts;
import com.my.project_linkus_back.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikesRepository extends JpaRepository<PostLikes, Long> {

    boolean existsByPostAndUser(Posts post, Users user);

    void deleteByPostAndUser(Posts post, Users user);

    long countByPost(Posts post);
}
