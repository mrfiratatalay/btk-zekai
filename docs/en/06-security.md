# Security

This page describes how the system handles identity, authorization and secrets, followed by the gaps I know
about. ZekAI was written in a hackathon week, which is why the "known gaps" table below is long; I chose to write
it down openly rather than hide it.

## Identity: two separate JWTs

Each product has its own identity system:

| | `commerce-api` | `zekai-api` |
|---|---|---|
| Issuer / audience | `commerce-api` / `commerce-clients` | `zekai-api` / `zekai-clients` |
| Access token | HS256 JWT, 24 hours | HS256 JWT, 24 hours |
| Refresh token | 64 cryptographically random bytes, 30 days | Two GUIDs joined together, 30 days |
| On refresh | The old token is revoked and a new one issued | The old token is revoked and a new one issued |
| Passwords | BCrypt | BCrypt |

The two services have different secrets, issuers and audiences, so a token from one is rejected by the other. On a
new login or refresh, `commerce-api` revokes all of the user's older refresh tokens, which leaves a single active
session per user. Code: [`AuthService`](../../services/commerce-api/src/ZekAI.Infrastructure/Services/AuthService.cs).

A failed login returns the same message in both cases ("E-posta veya şifre hatalı", wrong email or password), so
the message does not reveal which emails are registered.

## Store connection: the seller's API key

**Problem.** ZekAI has to read and update products on the marketplace on the seller's behalf, but it would be
wrong for ZekAI to know the seller's marketplace password.

**Solution.** Akıllı Market gives every seller an API key starting with `am_live_`; the seller sees it in their own
panel and can regenerate it. The seller enters the key into ZekAI; `zekai-api` first validates it against
`commerce-api` and then sends it as `Authorization: Bearer <key>` on every request.

`commerce-api` accepts two kinds of identity in the same header. A small "policy scheme" looks at the shape of the
token: if it contains a dot it goes to JWT validation, otherwise to API key validation. A request authenticated by
an API key is processed with that seller's identity and the `Seller` role. Code:
[`Program.cs`](../../services/commerce-api/src/ZekAI.Api/Program.cs),
[`ApiKeyAuthHandler`](../../services/commerce-api/src/ZekAI.Api/Auth/ApiKeyAuthHandler.cs).

**Why.** If the seller wants to leave ZekAI, regenerating the key is enough; they do not have to change their
password. Real marketplace integrations work the same way.

**Cost.** The key is a bearer secret: whoever gets hold of it can change all of the seller's products. It is not
possible to issue a key with narrower permissions, such as read-only.

## Authorization and data isolation

- The user's identity is always read from the token (`ClaimTypes.NameIdentifier`); a user ID in the request body
  is never trusted.
- Queries are filtered by user: an order is looked up with `o.Id == orderId && o.BuyerId == buyerId`, a draft with
  `d.UserId == userId`. Asking for someone else's record by ID returns `404`.
- `commerce-api` checks roles: `/api/buyer/*` is for `Buyer` only and `/api/seller/*` is for `Seller` only.

## Secrets and the AI key

- The Gemini key (`GOOGLE_API_KEY`) lives only in the `ai-service` environment. The browser never talks to the AI
  service; everything goes through `zekai-api`. If the key is not set, the AI endpoints answer `503` with a clear
  message.
- `.env` files are in `.gitignore`; the repository only contains `.env.example`.

## Error contract

The controllers catch expected exceptions, map them to status codes and return a single field in the body:

```json
{ "message": "Yalnızca bekleyen siparişler teslim alınabilir." }
```

(The message reads "only pending orders can be marked as received"; messages are in Turkish.)

| Exception | Status code |
|---|---|
| `KeyNotFoundException` | `404` |
| `InvalidOperationException` | `400` (`409` for sign-up and reviews) |
| `UnauthorizedAccessException` | `401` |
| An error from the AI service | The AI service's own code, with an `aiServiceStatus` field |

We do not use RFC 9457 Problem Details, and there is no global exception handler; an unexpected exception comes
back as `500`. That is on the list of gaps too.

## Known gaps

| Gap | Impact | What I would do |
|---|---|---|
| JWT secrets, the database password and the revalidation secret sit as default values in `appsettings.json` and `docker-compose.yml` | Convenient for local development, but if the same values reach a server, tokens can be forged | Read them only from environment variables and refuse to start without them |
| The seller's API key is stored in plain text in `zekai_db` and in `commerce-api` | If the database leaks, the keys leak with it | Store only a hash of the key in `commerce-api`; encrypt it with ASP.NET Data Protection in `zekai-api` |
| Refresh tokens are stored in plain text | If the database leaks, sessions can be hijacked | Store the SHA-256 hash of the token |
| The storefront revalidation secret (`zekai-revalidate-2024`) is embedded in the ZekAI frontend code | Anyone can make Akıllı Market drop its page cache; data does not change, but it adds needless load | Trigger revalidation only from the server |
| `zekai-api`'s seller endpoints have no role check | A buyer account can call them too; without a store connection it cannot do anything, but the rule is not written in code | `[Authorize(Roles = "Seller")]` |
| No rate limiting on the AI endpoints | A single user could inflate the Gemini bill | A per-user, per-minute limit with the ASP.NET rate limiter |
| No concurrency control on stock deduction | Two simultaneous orders can sell the last item twice | Optimistic locking with a row version (`xmin`) |
| Order numbers have one-second precision | Two orders in the same second hit the unique index and return `500` | Generate numbers from a sequence or with a random suffix |
| Login time depends on whether the email exists | Registered emails can be guessed from response times | Run a dummy BCrypt comparison when the email does not exist |
| Tokens are kept in `localStorage` | An XSS hole could read them | An HttpOnly cookie and a short-lived access token |
| `ai-service` starts Google ADK's developer UI (`web=True`) | If the service is exposed to the internet, agents can be called through that UI | `web=False` in production |
| No tests | None of these rules is protected automatically | Unit tests for the decision engine and bundle pricing first |

Each item in this list could be a real interview question. I have applied the fixes for some of them
(timing-safe login, hashed tokens, HttpOnly cookies) in other projects of mine.
Order of priority: [Interview questions and limits](12-faq-and-limits.md#roadmap).
