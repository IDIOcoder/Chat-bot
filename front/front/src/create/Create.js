import React, { useState } from 'react';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import './Create.css';
import './Create_mobile.css';
import { useNavigate,Link } from 'react-router-dom';
import Fade from 'react-reveal';
import { BrowserView,MobileView } from 'react-device-detect';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSignUp = () => {
        const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({ region: 'ap-northeast-2' });

        const params = {
            ClientId: process.env.REACT_APP_COGNITO_CLIENTID,
            Username: username,
            Password: password,
            UserAttributes: [
                { Name: 'email', Value: email }
            ]
        };

        cognitoIdentityServiceProvider.signUp(params, (err, data) => {
            if (err) {
                const errorType = getErrorType(err.code);
                alert(errorType)
            } else {
                alert("회원가입이 완료 되었습니다.\n이메일 인증완료 후 로그인 가능합니다."+params.Password);
                navigate('/');
            }
        });
    };
    const getErrorType = (errorCode) => {
        /*오류메세지를 한글로 출력하기 위함
        회원가입시 오류 상황에 맞는 오류들로 세분화*/
        switch (errorCode) {
            case 'InvalidParameterException':
                return '양식에 맞게 모든 칸을 입력해주세요.';
            case 'UsernameExistsException':
                return '사용자가 이미 존재합니다.';
            case 'InvalidPasswordException':
                return '옳바르지 않은 비밀번호 형식입니다.';
            case 'InvalidEmailException':
                return '이메일 형식에 맞게 입력해주세요.';
            case 'LimitExceededException':
                return '응답시간이 초과되었습니다.'
            default:
                return '양식에 맞게 제대로 입력해주세요!';
        }
    };

    return (
        <div>
            <BrowserView>
        <div className="margin">
            <Fade top delay = {0}>
            <div className='login-container-account'>
                <h2>회원가입</h2>
                <div className="c-text">아이디</div>
                <input type="text" placeholder="아이디(영문자)" value={username} onChange={(e) => setUsername(e.target.value)} />
                <div className="c-text">비밀번호</div>               
                <input type="password" placeholder="비밀번호(영어,숫자,특수문자 포함 8글자)" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="c-text">이메일</div>
                <input type="email" placeholder="이메일양식@naver.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button onClick={handleSignUp} className='account'>가입하기</button>
                <Link to ='/' className='to_login'>로그인 페이지</Link>
            </div>
            </Fade>
        </div>
        </BrowserView>
        <MobileView>
        <Fade top delay = {0}>
            <div className='margin_cr_mobile'/>
            <div className='login-container-account-mobile'>
                <h2>회원가입</h2>
                <div className="c-text-mobile">아이디</div>
                <input type="text" placeholder="아이디(영문자)" value={username} onChange={(e) => setUsername(e.target.value)} />
                <div className="c-text-mobile">비밀번호</div>               
                <input type="password" placeholder="비밀번호(영어,숫자,특수문자 포함 8글자)" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="c-text-mobile">이메일</div>
                <input type="email" placeholder="예시) 이메일양식@naver.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button onClick={handleSignUp} className='account'>가입하기</button>
                <Link to ='/' className='to_login'>로그인 페이지</Link>
            </div>
            </Fade>
        </MobileView>
        </div>
    );
};

export default SignUp;
