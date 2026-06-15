package com.my.project_linkus_back.common.exception;

public class UserNotFoundException extends BusinessException{
    public UserNotFoundException() {
        super("회원을 찾을 수 없습니다.");
    }
}
