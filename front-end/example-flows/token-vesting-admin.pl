
address(token, '0xc77e05ed963035f5b2d5f1be653c1dd2e92f1f9a').

init :-
  call_fn(token, ico, [SaleAddr]),
  assertz(address(sale, SaleAddr)),
  set(tab, status).

prompt :-
  prompt_once(intro),
  if is_owner
  then Message = 'Welcome, owner'
  else Message = 'You are not the owner',
  show [
    text(Message)
  ].

prompt :-
  is_owner,
  owner_prompt.

%%
%% Owner prompts
%%
owner_prompt :-
  get(tab, status),
  call_fn(sale, root, [Root]),
  show [
    text('Current root: ', Root),
    button('Change Root', [
      set(tab, change)
    ])
  ].

owner_prompt :-
  get(tab, change),
  show [
    row(
      col(
        text('New root:'),
        input(bytes32, newRoot)
      ),
      button('Update', { enabled: get(input/newRoot, _) }, [
        update_root
      ])
    )
  ].

update_root :-
  get(input/newRoot, NewRoot),
  call_fn(sale, setWhitelist(NewRoot), []),
  set(tab, status).

%%
%% Helpers
%%
is_owner :-
  get(me/address, Addr),
  call_fn(sale, owner, [Addr]).

%%
%% Boilerplate (you can generate this)
%%
abi(sale, [
  'CLIFF': uint256 / view,
  'QUARTERLY_VESTING': uint256 / view,
  'VESTING_SCHEDULE': uint256 / view,
  claim(tuple(array(bytes32), uint256, uint32, uint32, bool, bool, address)),
  claimableTokens(tuple(array(bytes32), uint256, uint32, uint32, bool, bool, address)): uint256 / view,
  lastClaimed(address): uint256 / view,
  nextClaimDate(tuple(array(bytes32), uint256, uint32, uint32, bool, bool, address)): uint256 / view,
  owner: address / view,
  permanentlyPause,
  permanentlyPaused: bool / view,
  remainingVestedTokens(tuple(array(bytes32), uint256, uint32, uint32, bool, bool, address)): uint256 / view,
  renounceOwnership,
  root: bytes32 / view,
  setWhitelist(bytes32),
  shipToken: address / view,
  tokensClaimed(address): uint256 / view,
  transferOwnership(address),
  undoPermanentPause
]).

abi(token, [
  'DEFAULT_ADMIN_ROLE': bytes32 / view,
  'GRACE_PERIOD': uint256 / view,
  'INITIAL_SUPPLY': uint256 / view,
  'TRANSFERER_ROLE': bytes32 / view,
  allowance(address, address): uint256 / view,
  approve(address, uint256): bool,
  balanceOf(address): uint256 / view,
  decimals: uint8 / view,
  decreaseAllowance(address, uint256): bool,
  dueDate: uint256 / view,
  getRoleAdmin(bytes32): bytes32 / view,
  grantRole(bytes32, address),
  hasRole(bytes32, address): bool / view,
  ico: address / view,
  increaseAllowance(address, uint256): bool,
  makePermanent,
  mint(address, uint256),
  name: string / view,
  pause,
  paused: bool / view,
  permanent: bool / view,
  pilot: bool / view,
  renounceRole(bytes32, address),
  revokeRole(bytes32, address),
  supportsInterface(bytes4): bool / view,
  symbol: string / view,
  totalSupply: uint256 / view,
  transfer(address, uint256): bool,
  transferFrom(address, address, uint256): bool,
  turnOffPilot,
  undoPermanance,
  unpause
]).
