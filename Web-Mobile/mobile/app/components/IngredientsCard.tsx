import { Text } from "react-native";

const IngredientCard = ({ ingredient }: { ingredient: string }) => {
  return ingredient ? (
      <Text style={{ color: "rgb(153, 113, 113)" }}>{ingredient}</Text>
  ) : null;
};

export default IngredientCard;
