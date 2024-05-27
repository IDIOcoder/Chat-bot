import React, { useEffect, useState } from 'react';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import './login.css';
import '../App.css';
import logo from '../icon.png';
import { Link,useNavigate } from 'react-router-dom';
import { Reveal } from 'react-reveal';
import axios from 'axios';
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const p_find = () =>{alert("비밀번호 찾기 페이지로 이동합니다.");}
    const c_account = () =>{alert("회원가입 페이지로 이동합니다.");}
    const e_account = () =>{alert("이메일 확인페이지로 이동합니다.");}
    
    const handleSignIn = () => {
        const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({ region: 'ap-northeast-2' });
        sessionStorage.setItem('loginType', 'regular')

        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: 'cognito_clientID',
            AuthParameters: {
                'USERNAME': username,
                'PASSWORD': password
            }
        };

        const decodeToken = (accessToken) => {
            const parts = accessToken.split('.');
            const decoded = JSON.parse(atob(parts[1].replace(/-/g, '').replace(/_/g, '')));
            return decoded;
        };                     
        
        cognitoIdentityServiceProvider.initiateAuth(params, (err, data) => {
            if (err) {
                const errcode = getErrorType(err.code)
                alert(errcode)
            } else {
                const token = decodeToken(data.AuthenticationResult.AccessToken);
                const sub = token.sub.toString().replace(/-/g, '');
                alert("로그인 성공!\n메인화면으로 이동합니다.");
                sessionStorage.setItem('sub',sub);
                
                navigate('/chating')
            }
        });
    };
    const getErrorType = (err) =>{
        switch (err) {    
            case 'UserNotConfirmedException':
                return '메일 확인이 완료되지 않은 사용자입니다.';
            case 'NotAuthorizedException':
                return '아이디 혹은 비밀번호가 잘못되었습니다.'
            case 'UserNotFoundException':
                return '등록되지 않은 사용자입니다.'
            case 'PasswordResetRequiredException:':
                return '비밀번호 재설정이 필요한 사용자입니다.'
            default:
                return "로그인 오류!";
        };
    }; 

    const social_google = () => {
        sessionStorage.setItem('loginType','google');
        const googleClientId = 'Google_client_id'; 
        const redirectUri = 'http://localhost:3000/chating';
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${googleClientId}&redirect_uri=${redirectUri}&scope=openid%20email%20profile`;
        window.location.href = authUrl;
    };

    return (
            <div className="backGround">
                <div className="margin"></div>
                <Reveal>
                <div className="login-container">
                    <img src={logo} alt="Recipe Chat Bot Logo" className="logo" />
                    <div className='title'> 공감 식당</div>
                    <div className="left-align">아이디</div>
                    <input type="text" placeholder="아이디를 입력하세요" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    <div className="left-align">비밀번호</div>
                    <input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleSignIn}>로그인</button>
                    <div className='pass'><Link to ='/Password' className='pass_p' onClick={p_find}>비밀번호 찾기</Link>
                    |  
                    <Link to='/Create' className='pass_c' onClick={c_account}>회원가입</Link>
                    |
                    <Link to='/Confirm' className='pass_e 'onClick={e_account}>메일 인증</Link></div>
                    <div  className='google'>
                        <img src='./google2.png' width='70%' height='50px' alt='Google Login' style={{cursor:'pointer'}} onClick={social_google}/>
                    </div>
                </div>
                <div className="margin-bot"></div>
                </Reveal>
            </div>
    );
};

export default Login;
