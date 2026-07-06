import { observer } from 'mobx-react-lite';
import ButtonWithDropDown from '../button/ButtonWithDropDown.jsx';

const AuthStatusButton = observer(function AuthStatusButton({
  data = {},
  config = {},
  onEvent,
}) {
  const username = `${data?.username ?? ''}`.trim();
  const isLoggedIn = data?.isLoggedIn === true;
  const label = isLoggedIn ? `login: ${username || 'user'}` : 'login';
  const items = [
    {
      id: 'go-login',
      label: 'go to login page',
      isDisabled: !isLoggedIn,
    },
    {
      id: 'sign-out',
      label: 'sign out',
      isDisabled: !isLoggedIn,
    },
  ];

  return (
    <ButtonWithDropDown
      data={{
        label,
        items,
        emptyText: 'no auth actions',
      }}
      config={{
        menuAlign: 'right',
        minWidth: 160,
        ...config,
      }}
      onEvent={(eventType, eventData) => {
        if (eventType !== 'itemClick') return;
        onEvent?.(`${eventData?.itemId ?? ''}`, eventData);
      }}
    />
  );
});

export default AuthStatusButton;
