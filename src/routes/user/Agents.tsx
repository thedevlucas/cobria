import MenuComponent from "../../components/menu/MenuComponent";
import PhoneNumberViewer from "../../components/phoneNumberViewer/PhoneNumberViewer";

export default function Agentes() {
  return (
    <div className="all">
      {MenuComponent()}
      <PhoneNumberViewer></PhoneNumberViewer>
    </div>
  );
}
