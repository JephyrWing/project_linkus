package com.my.project_linkus_back.common.service;

import com.my.project_linkus_back.common.exception.BadAccessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.region.static}")
    private String region;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(MultipartFile file) {
        // 파일명 중복을 방지하기 위해 UUID 생성
        String originalFilename = file.getOriginalFilename();
        String s3FileName = "posts/" + UUID.randomUUID().toString() + "_" + originalFilename;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3FileName)
                    .contentType(file.getContentType())
                    .build();

            // S3로 파일 전송
            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 업로드된 파일의 S3 URL 반환
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, s3FileName);

        } catch (IOException e) {
            throw new BadAccessException("S3 파일 업로드 중 오류 발생");
        }
    }
}
