package com.my.project_linkus_back.users.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public void sendCode(String email, String code) {
        String normalizedEmail = normalize(email);

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            System.out.println("Email verification code for " + normalizedEmail + ": " + code);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(normalizedEmail);
        message.setSubject("[LinkUs] 이메일 인증 코드");
        message.setText("인증 코드는 " + code + " 입니다.");
        mailSender.send(message);
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
