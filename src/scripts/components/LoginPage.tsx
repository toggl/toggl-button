import * as React from 'react';
import { Global, css } from '@emotion/core';
import styled from '@emotion/styled';
import browser from 'webextension-polyfill';

import Logo from '../icons/Logo';
import Spinner from './Spinner';

export interface LoginProps {
  isLoggedIn: boolean;
  isPopup: boolean;
  source: 'web-login' | 'install';
}

interface LoginState {
  loading: boolean;
  error: string | null;
  loggedIn: boolean;
}

async function login (setState: React.Dispatch<React.SetStateAction<LoginState>>) {
  setState({ loading: true, error: null, loggedIn: false });

  const { error, success: loggedIn } = await browser.runtime.sendMessage({
    type: 'sync',
    respond: true
  });

  setState({ loading: false, error, loggedIn });
}

export default function LoginPage ({ source, isLoggedIn, isPopup }: LoginProps) {
  const [ state, setState ] = React.useState({ loading: false, error: null, loggedIn: isLoggedIn });
  const { loading, error, loggedIn } = state;

  let content = (
    <Content>
      <Row>
        <Heading>Nearly there!</Heading>
        <Subheading>Click the button below to login to your Toggl account</Subheading>
      </Row>
      <Row>
        <LoginButton isPopup={isPopup} />
        <SignupButton isPopup={isPopup} />
      </Row>
    </Content>
  );

  if (source === 'web-login') {
    if (!loggedIn && !loading && !error) {
      login(setState);
    }

    if (loading) {
      content = (
        <Content>
          <Row>
            <Heading>Logging you in</Heading>
          </Row>
          <CenteredButton>
            <Spinner />
          </CenteredButton>
        </Content>
      );
    }

    if (error) {
      content = (
        <Content>
          <Row>
            <Heading>Uh-oh.</Heading>
            <Subheading>Something went wrong...</Subheading>
          </Row>
          <Subheading>
            {error}
          </Subheading>
          <Row>
            <a href="login.html?source=install" style={{ marginBottom: 21 }}>
              <Button>Try again</Button>
            </a>
            <Subheading>or</Subheading>
            <a href="mailto:support@toggl.com" style={{ color: 'white' }}>
              <Subheading style={{ margin: 0 }}>Contact support</Subheading>
            </a>
          </Row>
        </Content>
      );
    }
  }

  if (loggedIn) {
    content = (
      <Content>
        <Row>
          <Heading>You're all set!</Heading>
          <Subheading>Click the Toggl icon in your toolbar to start tracking time</Subheading>
        </Row>
        <Button onClick={closePage}>Close page</Button>
        <Link href="settings.html?tab=integrations">
          Want to enable Toggl Button in other tools? Visit the integration settings.
        </Link>
      </Content>
    );
  }

  return (
    <React.Fragment>
      <Global styles={page} />
      <Header style={{ display: 'flex' }}>
        <LogoWrapper>
          <Logo />
        </LogoWrapper>
        <HeaderLinks loggedIn={loggedIn} />
      </Header>
      <ContentWrapper>
        {content}
      </ContentWrapper>
    </React.Fragment>
  )
}

function HeaderLinks ({ loggedIn }: Pick<LoginState, 'loggedIn'>) {
  if (!loggedIn) {
    return null;
  }
  return (
    <Links>
      <li>
        <Link href="https://support.toggl.com/browser-extensions">
          Support
        </Link>
      </li>
      <li>
        <Link href="settings.html?tab=integrations">
          Integrations
        </Link>
      </li>
      <li>
        <Link href="settings.html?tab=account">
          Account
        </Link>
      </li>
      <li>
        <Link href="settings.html">
          Settings
        </Link>
      </li>
    </Links>
  );
}

function LoginButton ({ isPopup }: Pick<LoginProps, 'isPopup'>) {
  const url = `${process.env.TOGGL_WEB_HOST}/toggl-button-login/`;
  return (
    isPopup
    ? <a href='#' onClick={openPage(url)}><Button>Login</Button></a>
    : <a href={url}><Button>Login</Button></a>
  );
}

function SignupButton ({ isPopup }: Pick<LoginProps, 'isPopup'>) {
  const url = `${process.env.TOGGL_WEB_HOST}/signup/?utm_source=toggl-button&utm_medium=referral`;
  const style = { marginTop: 20 };
  return (
    isPopup
    ? <Link style={style} href='#' onClick={openPage(url)}>Create account</Link>
    : <Link style={style} href={url}>Create account</Link>
  );
}

const openPage = (url: string) => () => browser.tabs.create({ url });

const closePage = async () => {
  const tab = await browser.tabs.getCurrent();
  browser.tabs.remove(tab.id);
};

const page = css`
  html, body, #app {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    margin: 0;
    background: #ca9eda;
    display: flex;
    flex-direction: column;
  }
`;

const Header = styled.header`
  padding: 30px 24px;
  justify-content: space-between;
 `;

const Links = styled.ul`
  display: flex;
  list-style-type: none;
  margin: 0;

  & li {
    margin-left: 25px;
  }
`;

const Link = styled.a`
  font-size: 13px;
  font-weight: 500;
  color: #282a2d;
  line-height: 36px;
  text-decoration: none;

  :hover, :focus, :active {
    text-decoration: underline;
  }
`;

const ContentWrapper = styled.main`
  height: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const LogoWrapper = styled.span`
  min-height: 36px;
  display: flex;
  align-items: center;

  & svg {
    fill: #282a2d;
  }
`;

const Content = styled.div`
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  & h1 {
    margin-bottom: 21px;
  }
`;

const Heading = styled.h1`
  font-size: 48px;
  color: white;
  font-weight: 700;
  margin: 0;
`;

const Subheading = styled(Heading)`
  color: white;
  font-size: 21px;
  font-weight: 500;
`;

const Button = styled.button`
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: baseline;
  justify-content: center;
  background-color: #e24f54;
  border: 0;
  border-radius: 24px;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  height: 48px;
  line-height: 48px;
  min-width: 218px;
  position: relative;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  width: auto;
  padding: 0 15px;
  outline: none;
`;

const CenteredButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
`;
