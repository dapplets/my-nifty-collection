import React from 'react';
import { Menu, Dropdown } from 'semantic-ui-react';

interface IDropdownMenuProps {
  isConnected: boolean;
  nearWalletLink: string;
  currentNearAccount: string;
  isLinked: boolean;
  user: string;
  handleLink: () => {};
  handleUnlink: () => {};
  handleConnect: () => {};
}

export default function DropdownMenu(props: IDropdownMenuProps) {
  const {
    isConnected,
    nearWalletLink,
    currentNearAccount,
    isLinked,
    user,
    handleUnlink,
    handleLink,
    handleConnect,
  } = props;
  return (
    <div style={{ display: 'inline-block', float: 'right', marginTop: '10px' }}>
      <Menu style={{ border: 'none', boxShadow: 'none' }}>
        <Menu.Menu position="right">
          <Dropdown
            item
            simple
            icon="ellipsis vertical"
            style={{ fontSize: '1.2em' }}
            direction="right"
          >
            <Dropdown.Menu>
              {isConnected ? (
                <>
                  <Dropdown.Item>
                    Connected to{' '}
                    <a href={nearWalletLink} target="_blank" rel="noreferrer">
                      {currentNearAccount}
                    </a>
                  </Dropdown.Item>
                  {isLinked ? (
                    <Dropdown.Item onClick={handleUnlink} className="red">
                      Unlink account @{user}
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item onClick={handleLink} className="green">
                      Link account @{user}
                    </Dropdown.Item>
                  )}
                </>
              ) : (
                <Dropdown.Item className="connect" onClick={handleConnect}>
                  <p>
                    Connect to <b>NEAR</b>
                  </p>
                  <p>
                    to <span>link</span> or <span>unlink</span>
                  </p>
                  <p>the Twitter account</p>
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Menu>
    </div>
  );
}
