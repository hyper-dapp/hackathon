
oracle(vestings, r, 'ds.shipyard.xyz').

address(token, '0xc77e05ed963035f5b2d5f1be653c1dd2e92f1f9a').

init :-
  call_fn(token, ico, [SaleAddr]),
  assertz(address(sale, SaleAddr)).

%%
%% Everyone
%%
prompt :-
  is_paused,
  prompt_once(note),
  show [
    text('Note: Tokens are currently non-transferrable'),
    debug(is_paused)
  ].

%%
%% End Users
%%
prompt :-
  \+ vesting(_),
  show text('You are not part of the sale.').

prompt :-
  vesting({ startDate: StartDate }),
  prompt_once(started),
  show [
    debug(started(StartDate)),
    text('Your tokens started vesting on ', date(StartDate, 'MMM Do, YYYY'), '.')
  ].

prompt :-
  claimed(C),
  C > 0,
  vesting({ allocation: A }),
  show [
    text('You have claimed ', eth(C, 'SHIP'), ' out of ', eth(A, 'SHIP'), ' tokens.')
  ].

prompt :-
  claimed(0),
  vesting({ allocation: A }),
  show [
    text('You have ', eth(A, 'SHIP'), ' tokens allocated.'),
    debug(tokens(A))
  ].

prompt :-
  claimable(C),
  C > 0,
  show [
    text('You can claim ', eth(C, 'SHIP'), ' tokens.'),
    button('Claim', [
      proof_payload(P),
      call_fn(sale, claim(P), [])
    ])
  ].

prompt :-
  claimable(0),
  next_claim_date(Date),
  show [
    text('Your next claim date is ', date(Date, 'MMM Do, YYYY'))
  ].


%%
%% Helpers
%%
is_owner :-
  get(me/address, Addr),
  call_fn(sale, owner, [Addr]).

is_paused :-
  call_fn(token, paused, [{true}]).

vesting(A) :-
  get(me/address, Addr),
  get_http(vestings, '/token-vestings/' ++ Addr, A).

claimable(C) :-
  proof_payload(P),
  call_fn(sale, claimableTokens(P), [C]).

claimed(C) :-
  get(me/address, Addr),
  call_fn(sale, tokensClaimed(Addr), [C]).

next_claim_date(DateInSeconds) :-
  proof_payload(P),
  call_fn(sale, nextClaimDate(P), [DateInSeconds]).

proof_payload([P1, P2, P3, P4, P5, P6, P7]) :-
  vesting({
    proof: P1,
    allocation: P2,
    startDate: P3,
    stopDate: P4,
    paid: P5,
    cliff: P6,
    account: P7
  }).

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
