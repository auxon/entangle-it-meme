import {json, redirect} from '@remix-run/node';
import {createOAuth2Client} from 'oauth2-client';
import {getSession, commitSession} from '~/sessions'; // Assuming session management is set up

const clientID = "your-client-id";
const clientSecret = "your-client-secret";
const redirectUri = "https://your-shopify-hydrogen-app.com/api/auth/callback";

const oauthClient = createOAuth2Client({
  clientId: clientID,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
  authorizationEndpoint: "https://api.vimeo.com/oauth/authorize",
  tokenEndpoint: "https://api.vimeo.com/oauth/access_token",
});

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const session = await getSession(request.headers.get("Cookie"));

  if (url.searchParams.has("code")) {
    const code = url.searchParams.get("code")!;
    const tokens = await oauthClient.getToken({
      code,
    });

    session.set("vimeo_access_token", tokens.access_token);
    return redirect("/", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } else {
    return redirect(
      oauthClient.getAuthorizationUrl({
        scope: ["public", "private"], // Scope as needed
      })
    );
  }
}
