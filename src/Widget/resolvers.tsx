import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { base_encode } from "near-api-js/lib/utils/serialize";

export const ImportAccountsResolver = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const keystore = location.hash.slice(1);
    const query = new URLSearchParams(window.location.search);
    const request = JSON.stringify({
      network: query.get("network") || undefined,
      type: "import",
      keystore,
    });

    navigate(`/request/${base_encode(request)}?${query}`);
  }, [navigate, location]);

  return null;
};

export const CustomRequestResolver = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`https://api.herewallet.app/api/v1/dapp/generate_transaction/${id}`);
      const query = new URLSearchParams(window.location.search);
      const { data } = await res.json();
      navigate(`/request/${data}?${query}`);
    };

    load();
  }, [navigate, id]);

  return null;
};

export const KeypomResolver = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      const query = new URLSearchParams(window.location.search);
      const secret = params.secret || location.hash.slice(1);
      const request = JSON.stringify({
        contract: params.id,
        type: "keypom",
        secret,
      });

      navigate(`/request/${base_encode(request)}?${query}`);
    };

    load();
  }, [navigate, params]);

  return null;
};
