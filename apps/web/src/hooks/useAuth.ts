import { gql, useQuery } from "@apollo/client";

const ME_QUERY = gql`
  query Me {
    me {
      id
      nombre
      email
      rol
    }
  }
`;

export function useAuth() {
  const { data, loading } = useQuery(ME_QUERY, { errorPolicy: "ignore" });
  return {
    isAuthenticated: !!data?.me,
    usuario: data?.me ?? null,
    loading,
  };
}
