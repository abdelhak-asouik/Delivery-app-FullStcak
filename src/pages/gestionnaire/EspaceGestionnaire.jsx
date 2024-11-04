import React, { useEffect, useState, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../api/AuthContext';

const EspaceGestionnaire = () => {
  const { logout } = useContext(AuthContext);
  const [userData, setUserData] = useState({ nom: '', region: '' });
  const [livreurs, setLivreurs] = useState([]);
  const [unassignedCommandes, setUnassignedCommandes] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedTab, setSelectedTab] = useState('commandes');
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filteredLivreurs, setFilteredLivreurs] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [filteredCommandes, setFilteredCommandes] = useState([]);

  // Fetch gestionnaire info, livreurs, commandes, and provinces
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/gestionnaire/me');
        setUserData(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
    };

    const fetchLivreurs = async () => {
      try {
        const response = await axios.get('/gestionnaire/livreurs');
        setLivreurs(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des livreurs:', error);
      }
    };

    const fetchUnassignedCommandes = async () => {
      try {
        const response = await axios.get('/gestionnaire/unassigned-commandes');
        setUnassignedCommandes(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes non assignées:', error);
      }
    };

    const fetchProvinces = async () => {
      try {
        const response = await axios.get('/provinces');
        setProvinces(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des provinces:', error);
      }
    };

    fetchUserData();
    fetchLivreurs();
    fetchUnassignedCommandes();
    fetchProvinces();
  }, []);
//filter commande by province
  const handleFilterByProvince = (province) => {
    setSelectedProvince(province);
    if (province) {
      setFilteredCommandes(unassignedCommandes.filter(commande => commande.provincePostalCode.provinceName === province));
    } else {
      setFilteredCommandes(unassignedCommandes); // Afficher toutes les commandes si aucune province n'est sélectionnée
    }
  };

  // Open Assign Commande Modal and filter livreurs by province
  const handleAffecterCommande = (commande) => {
    setSelectedCommande(commande);
    const filtered = livreurs.filter(
      (livreur) => livreur.province === commande.provincePostalCode.provinceName
    );
    setFilteredLivreurs(filtered);
    setShowAssignModal(true);
  };

  // Assign Commande to selected Livreur
  const assignCommandeToLivreur = async (livreurId) => {
    if (selectedCommande) {
      try {
        await axios.post(`/gestionnaire/assign-commande/${selectedCommande.id}/livreur/${livreurId}`);
        setSuccessMessage('Affectation réussie!');
        setShowAssignModal(false);
        fetchUnassignedCommandes(); // Refresh the list of unassigned commandes
      } catch (error) {
        console.error('Erreur lors de l\'affectation de la commande:', error);
      }
    }
  };

  // Open Update Commande Modal
  const handleUpdateCommande = (commande) => {
    setSelectedCommande(commande);
    setShowUpdateModal(true);
  };

  // Update Commande
  const updateCommande = async () => {
    if (selectedCommande) {
      try {
        await axios.put(`/gestionnaire/update-commande/${selectedCommande.id}`, {
          provincePostalCodeId: selectedCommande.provincePostalCode.id,
          shippingAddress: selectedCommande.shippingAddress,
          receiverPhoneNumber: selectedCommande.receiverPhoneNumber,
          packagePrice: selectedCommande.packagePrice,
          deliveryPrice: selectedCommande.deliveryPrice,
        });
        setSuccessMessage('Mise à jour réussie!');
        setShowUpdateModal(false);
        fetchUnassignedCommandes(); // Refresh the list of unassigned commandes
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la commande:', error);
      }
    }
  };

  const renderCommandesList = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Liste des Commandes Non Assignées</h2>
      {/* Boutons de filtre par province */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleFilterByProvince(null)}
          className={`px-4 py-2 font-serif rounded ${!selectedProvince ? 'bg-darkCyan text-white' : 'bg-white text-darkCyan'}`}
        >
          Toutes
        </button>
        {provinces.map((province) => (
          <button
            key={province.id}
            onClick={() => handleFilterByProvince(province.provinceName)}
            className={`px-4 py-2 rounded font-roboto ${selectedProvince === province.provinceName? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}
          >
            {province.provinceName}
          </button>
        ))}
      </div>
      <ul>
        {filteredCommandes.map((commande) => (
          <li key={commande.id} className="p-4 border-b">
            <p><strong>Adresse:</strong> {commande.shippingAddress}</p>
            <p><strong>Numéro de téléphone:</strong> {commande.receiverPhoneNumber}</p>
            <p><strong>Prix du colis:</strong> {commande.packagePrice} MAD</p>
            <p><strong>Livraison:</strong> <i>{commande.deliveryPrice}</i></p>
            <p><strong>Province:</strong> {commande.provincePostalCode.provinceName}</p>
            <p><strong>Région:</strong> {commande.provincePostalCode.region.regionName}</p>
            <button
              onClick={() => handleAffecterCommande(commande)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full font-roboto"
            >
              Affecter
            </button>
            <button
              onClick={() => handleUpdateCommande(commande)}
              className=" ml-2 mt-2 px-4 py-2 border-2 bg-lightCyan text-darkCyan rounded-full font-roboto"
            >
              Modifier
            </button>

          </li>
        ))}
      </ul>
      {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
    </div>
  );
//------------------------------------------------------------------------------------------
  // ---------------------------------TAB LIVREURE--------------------------------------------
  //------------------------------------------------------------------------------------------

  const renderLivreursList = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Liste des Livreurs</h2>
      <button
        onClick={() => setShowAddLivreurModal(true)}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Ajouter Livreur
      </button>
      <ul>
        {livreurs.map((livreur) => (
          <li key={livreur.userId} className="p-4 border-b">
            <p><strong>Nom:</strong> {livreur.nom}</p>
            <p><strong>Email:</strong> {livreur.email}</p>
            <p><strong>Téléphone:</strong> {livreur.telephone}</p>
            <p><strong>Province:</strong> {livreur.province}</p>
            <button
              onClick={() => openUpdateLivreurModal(livreur)}
              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded"
            >
              Modifier
            </button>
            <button
              onClick={() => handleDeleteLivreur(livreur.userId)}
              className="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>

      {/* Add Livreur Modal */}
      {showAddLivreurModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Ajouter Livreur</h2>
            <input
              type="text"
              placeholder="Nom"
              value={newLivreurData.nom}
              onChange={(e) => setNewLivreurData({ ...newLivreurData, nom: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <input
              type="email"
              placeholder="Email"
              value={newLivreurData.email}
              onChange={(e) => setNewLivreurData({ ...newLivreurData, email: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={newLivreurData.password}
              onChange={(e) => setNewLivreurData({ ...newLivreurData, password: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <input
              type="text"
              placeholder="Adresse"
              value={newLivreurData.adresse}
              onChange={(e) => setNewLivreurData({ ...newLivreurData, adresse: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <input
              type="text"
              placeholder="Téléphone"
              value={newLivreurData.telephone}
              onChange={(e) => setNewLivreurData({ ...newLivreurData, telephone: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <select
              value={newLivreurData.provinceId}
              onChange={(e) => setNewLivreurData({ ...newLivreurData, provinceId: e.target.value })}
              className="w-full mb-2 p-2 border"
            >
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.provinceName}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddLivreur}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Ajouter
            </button>
            <button
              onClick={() => setShowAddLivreurModal(false)}
              className="mt-4 px-4 py-2  rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Update Livreur Modal */}
      {showUpdateLivreurModal && selectedLivreur && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Modifier Livreur</h2>
            <input
              type="text"
              placeholder="Nom"
              value={selectedLivreur.nom}
              onChange={(e) => setSelectedLivreur({ ...selectedLivreur, nom: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <input
              type="text"
              placeholder="Téléphone"
              value={selectedLivreur.telephone}
              onChange={(e) => setSelectedLivreur({ ...selectedLivreur, telephone: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <select
              value={selectedLivreur.provincePostalCodeId}
              onChange={(e) => setSelectedLivreur({ ...selectedLivreur, provincePostalCodeId: e.target.value })}
              className="w-full mb-2 p-2 border"
            >
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.provinceName}
                </option>
              ))}
            </select>
            <input
              type="email"
              placeholder="Email"
              value={selectedLivreur.email}
              onChange={(e) => setSelectedLivreur({ ...selectedLivreur, email: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={selectedLivreur.password}
              onChange={(e) => setSelectedLivreur({ ...selectedLivreur, password: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <button
              onClick={handleUpdateLivreur}
              className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
            >
              Sauvegarder
            </button>
            <button
              onClick={() => setShowUpdateLivreurModal(false)}
              className="mt-4 px-4 py-2 rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const [showAddLivreurModal, setShowAddLivreurModal] = useState(false);
  const [showUpdateLivreurModal, setShowUpdateLivreurModal] = useState(false);
  const [newLivreurData, setNewLivreurData] = useState({
    nom: '',
    email: '',
    password: '',
    role: 'LIVREUR',
    adresse: '',
    telephone: '',
    provinceId: 0,
  });
  const [selectedLivreur, setSelectedLivreur] = useState(null);

  useEffect(() => {
    fetchLivreursData();
  }, []);

  const fetchLivreursData = async () => {
    try {
      const response = await axios.get('/gestionnaire/livreurs');
      setLivreurs(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs:', error);
    }
  };


  const handleAddLivreur = async () => {
    try {
      await axios.post('/gestionnaire/add-livreur', newLivreurData);
      fetchLivreursData();
      setShowAddLivreurModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livreur:', error);
    }
  };

  const handleUpdateLivreur = async () => {
    if (selectedLivreur) {
      try {
        await axios.put(`/gestionnaire/update-livreur/${selectedLivreur.userId}`, {
          nom: selectedLivreur.nom,
          telephone: selectedLivreur.telephone,
          provincePostalCodeId: selectedLivreur.provincePostalCodeId,
          email: selectedLivreur.email,
          password: selectedLivreur.password,
        });
        fetchLivreursData();
        setShowUpdateLivreurModal(false);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du livreur:', error);
      }
    }
  };

  const openUpdateLivreurModal = (livreur) => {
    setSelectedLivreur({
      ...livreur,
      provincePostalCodeId: livreur.provincePostalCodeId || provinces[0].id,
    });
    setShowUpdateLivreurModal(true);
  };
  const handleDeleteLivreur = async (livreurId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce livreur ?")) {
      try {
        const response = await axios.delete(`/gestionnaire/drop-livreur/${livreurId}`);
        console.log(response);
        alert("Livreur supprimé avec succès.");
        // Mettre à jour la liste des livreurs après suppression
        setLivreurs((prevLivreurs) => prevLivreurs.filter((livreur) => livreur.userId !== livreurId));
      } catch (error) {
        alert("Erreur lors de la suppression du livreur.");
        console.error(error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Espace Gestionnaire</h1>
          <p className="text-sm text-gray-500">Région: {userData.region}</p>
          <p className="text-l text-gray-500">{userData.nom}</p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 text-white font-semibold py-2 px-4 rounded"
        >
          Déconnexion
        </button>
      </header>

      {/* Tabs for navigation */}
      <div className="mb-6">
        <button
          onClick={() => setSelectedTab('commandes')}
          className={`px-4 py-2 mr-4 ${selectedTab === 'commandes' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'} rounded-full`}
        >
          Commandes
        </button>
        <button
          onClick={() => setSelectedTab('livreurs')}
          className={`px-4 py-2 ${selectedTab === 'livreurs' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'} rounded-full`}
        >
          Livreurs
        </button>
      </div>

      {/* Tab content */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {selectedTab === 'commandes' && renderCommandesList()}
        {selectedTab === 'livreurs' && renderLivreursList()}
      </div>

      {/* Assign Commande Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Sélectionnez un livreur</h2>
            <ul>
              {filteredLivreurs.map((livreur) => (
                <li key={livreur.userId} className="p-2 border-b">
                   <p><strong>Nom:</strong> {livreur.nom}</p>
                   <p><strong>Téléphone:</strong> {livreur.telephone}</p>
                   <p><strong>Province:</strong> {livreur.province}</p>
                  <button
                    onClick={() => assignCommandeToLivreur(livreur.userId)}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
                  >
                    Sélectionner
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowAssignModal(false)} className="mt-4 px-4 py-2 bg-gray-500  rounded">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Update Commande Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Modifier Commande</h2>
            <div className="mb-4">
              <label>Adresse de livraison:</label>
              <input
                type="text"
                value={selectedCommande.shippingAddress}
                onChange={(e) =>
                  setSelectedCommande({ ...selectedCommande, shippingAddress: e.target.value })
                }
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label>Numéro de téléphone:</label>
              <input
                type="text"
                value={selectedCommande.receiverPhoneNumber}
                onChange={(e) =>
                  setSelectedCommande({ ...selectedCommande, receiverPhoneNumber: e.target.value })
                }
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label>Prix du colis:</label>
              <input
                type="number"
                value={selectedCommande.packagePrice}
                onChange={(e) =>
                  setSelectedCommande({ ...selectedCommande, packagePrice: e.target.value })
                }
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label>Livraison:</label>
              <select
                value={selectedCommande.deliveryPrice}
                onChange={(e) =>
                  setSelectedCommande({ ...selectedCommande, deliveryPrice: e.target.value })
                }
                className="border p-2 w-full"
              >
                <option value="INCLUS">INCLUS</option>
                <option value="NON_INCLUS">NON_INCLUS</option>
              </select>
            </div>
            <div className="mb-4">
              <label>Province:</label>
              <select
                value={selectedCommande.provincePostalCode.id}
                onChange={(e) =>
                  setSelectedCommande({
                    ...selectedCommande,
                    provincePostalCode: { ...selectedCommande.provincePostalCode, id: e.target.value },
                  })
                }
                className="border p-2 w-full"
              >
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.provinceName}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={updateCommande}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Sauvegarder
            </button>
            <button
              onClick={() => setShowUpdateModal(false)}
              className="mt-4 px-4 py-2 rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EspaceGestionnaire;
