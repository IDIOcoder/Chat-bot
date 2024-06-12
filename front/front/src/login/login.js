import React, { useState, useEffect } from 'react';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import './login.css';
import '../App.css';
import './mobile_login.css';
import logo from '../icon.png';
import { Link, useNavigate } from 'react-router-dom';
import { Reveal } from 'react-reveal';
import {BrowserView,MobileView} from "react-device-detect";
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                handleSignIn();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [username, password]);

    const p_find = () => { alert("비밀번호 찾기 페이지로 이동합니다."); }
    const c_account = () => { alert("회원가입 페이지로 이동합니다."); }
    const e_account = () => { alert("이메일 확인페이지로 이동합니다."); }

    const handleSignIn = async () => {
        const cognitoLogin = new CognitoIdentityServiceProvider({ region: 'ap-northeast-2' });
        sessionStorage.setItem('loginType', 'regular');

        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.REACT_APP_COGNITO_CLIENTID,
            AuthParameters: {
                'USERNAME': username,
                'PASSWORD': password
            }
        };

        const decodeT = (accessToken) => {
            const parts = accessToken.split('.');
            const decoded = JSON.parse(atob(parts[1].replace(/-/g, '').replace(/_/g, '')));
            return decoded;
        };

        try {
            // const data = await cognitoLogin.initiateAuth(params).promise();
            // const token = decodeT(data.AuthenticationResult.AccessToken);
            // const sub = token.sub.toString().replace(/-/g, '');
            const data = await cognitoLogin.initiateAuth(params).promise();
            const access_token = data.AuthenticationResult.AccessToken;
            const RefreshToken = data.AuthenticationResult.RefreshToken;
            // const sub = decodeT(access_token).sub.toString().replace(/-/g, '');
            alert("로그인 성공!\n메인화면으로 이동합니다.");
            // sessionStorage.setItem('sub', sub);
            sessionStorage.setItem('accessToken',access_token);
            sessionStorage.setItem('refreshToken',RefreshToken);
            navigate('/chating');
        } catch (err) {
            const errcode = getErrorType(err.code);
            alert(errcode);
        }
    };

    const getErrorType = (err) => {
        switch (err) {
            case 'UserNotConfirmedException':
                return '메일 확인이 완료되지 않은 사용자입니다.';
            case 'NotAuthorizedException':
                return '아이디 혹은 비밀번호가 잘못되었습니다.';
            case 'UserNotFoundException':
                return '등록되지 않은 사용자입니다.';
            case 'PasswordResetRequiredException:':
                return '비밀번호 재설정이 필요한 사용자입니다.';
            default:
                return "로그인 오류!";
        }
    };

    const social_google = () => {
        sessionStorage.setItem('loginType', 'google');
        const googleClientId = process.env.REACT_APP_GOOGLE_CLIENTID;
        const redirectUri = `${window.location.origin}/chating`;
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&redirect_uri=${redirectUri}&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
        window.location.href = authUrl;
    };

    return (
        <div>
        <BrowserView>
        <div className="backGround">
            <div className="margin"></div>
            <Reveal>
                <div className="login-container">
                    <img src={logo} alt="Recipe Chat Bot Logo" className="logo" />
                    <div className='title'> 공감 식당</div>
                    <div className="left-align">아이디</div>
                    <input type="text" placeholder="아이디를 입력하세요" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <div className="left-align">비밀번호</div>
                    <input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleSignIn}>로그인</button>
                    <div className='pass'>
                        <Link to='/Password' className='pass_p' onClick={p_find}>비밀번호 찾기</Link>
                        |
                        <Link to='/Create' className='pass_c' onClick={c_account}>회원가입</Link>
                        |
                        <Link to='/Confirm' className='pass_e ' onClick={e_account}>메일 인증</Link>
                    </div>
                    <div className='google'>
                        <img src='./google2.png' width='70%' height='50px' alt='Google Login' style={{ cursor: 'pointer' }} onClick={social_google} className='g_img'/>
                    </div>
                </div>
                <div className="margin-bot"></div>
            </Reveal>
        </div>
        </BrowserView>
        <MobileView>
        <Reveal>
            <div className='margin_mobile'/>
                <div className="login-container_mobile">
            <img src={logo} alt="Recipe Chat Bot Logo" className='logo_mobile'/>
            <div className='title_mobile'> 공감 식당</div>
            <div className="left-align">아이디</div>
            <input type="text" placeholder="아이디를 입력하세요" value={username} onChange={(e) => setUsername(e.target.value)} />
            <div className="left-align">비밀번호</div>
            <input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleSignIn}>로그인</button>
            <div className='pass_mobile'>
                <Link to='/Password' className='pass_p_mobile' onClick={p_find}>비밀번호 찾기</Link>
                |
                <Link to='/Create' className='pass_c_mobile' onClick={c_account}>회원가입</Link>
                |
                <Link to='/Confirm' className='pass_e_mobile' onClick={e_account}>메일 인증</Link>
            </div>
            <div className='google'>
                <img src='./google2.png' width='70%' height='50px' alt='Google Login' style={{ cursor: 'pointer' }} onClick={social_google} className='g_img'/>
            </div>
        </div>
        {/* <div className="margin-bot"></div> */}
        </Reveal>
        </MobileView>
        </div>
    );
};

export default Login;
