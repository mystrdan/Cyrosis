from cyro.cli import main

def test_knowledge_add(tmp_path, monkeypatch, capsys):
    from cyro.config import Settings
    monkeypatch.setattr("cyro.cli.settings", Settings(data_dir=str(tmp_path)))
    assert main(["knowledge", "add", "Ghana", "Accra is the capital.", "--source", "test"]) == 0
    assert "Knowledge added: 1" in capsys.readouterr().out
