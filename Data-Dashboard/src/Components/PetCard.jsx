import './PetCard.css';
const PetCard = ({ pet }) => {
  return (
    <tr>
      
      <td>{pet.name}</td>
      <td>{pet.contact.address.state}</td>
      <td>{pet.age}</td>
      <td>{pet.type}</td>
      <td>{pet.breeds.primary}</td>
      <td><img src={pet.photos[0]?.small || 'https://via.placeholder.com/150'} alt={pet.name} width="250" height="250" /></td>
    </tr>
  );
}

export default PetCard;
