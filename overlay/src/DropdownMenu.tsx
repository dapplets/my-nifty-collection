import React from 'react';
import { Menu, Dropdown } from 'semantic-ui-react';

interface IDropdownMenuProps {
  isConnected: boolean;
  currentNearAccount: string;
  isLinked: boolean;
  user: string;
  handleLink: (e: any) => {};
  handleUnlink: (e: any) => {};
  handleConnect: (e: any) => {};
  updateNearAccount: (e: any) => {};
}

export default function DropdownMenu(props: IDropdownMenuProps) {
  const {
    isConnected,
    currentNearAccount,
    isLinked,
    user,
    handleUnlink,
    handleLink,
    handleConnect,
    updateNearAccount,
  } = props;
  return (
    <div style={{ display: 'inline-block', float: 'right', marginTop: '15px' }}>
      <Menu style={{ border: 'none', boxShadow: 'none' }} onMouseOver={updateNearAccount}>
        <Menu.Menu position="right">
          <Dropdown
            item
            simple
            icon="ellipsis vertical"
            style={{ fontSize: '1.2em', padding: '1px 5.1px' }}
            direction="right"
          >
            <Dropdown.Menu>
              {isConnected ? (
                <>
                  <Dropdown.Item onClick={(e: any) => e.stopPropagation()}>
                    Connected to{' '}
                    <a href={`https://explorer.testnet.near.org/accounts/${currentNearAccount}`} target="_blank" rel="noreferrer">
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
