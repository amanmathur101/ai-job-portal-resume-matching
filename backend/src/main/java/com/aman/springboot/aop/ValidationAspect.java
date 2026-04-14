package com.aman.springboot.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@Aspect
public class ValidationAspect {
    private static final Logger LOGGER = LoggerFactory.getLogger(ValidationAspect.class);

    @Around("execution(* com.aman.springboot.service.JobService.getJob(..)) && args(postId)")
    public Object validateAndupdate (ProceedingJoinPoint jp,int postId ) throws Throwable {
        if (postId <= 0){
            LOGGER.info("PostID is negative or zero, rejecting it");
            return null;
        }
        Object obj = jp.proceed(new Object[] {postId});
        return obj;
    }
}
